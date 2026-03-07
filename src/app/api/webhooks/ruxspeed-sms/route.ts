import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * RuxSpeed SMS Webhook
 * Called by the Android RuxSpeed agent when a bKash/Nagad SMS is received.
 *
 * POST /api/webhooks/ruxspeed-sms
 * Body: { store_id, app_secret, provider, sender_number, trx_id, amount, timestamp }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { store_id, app_secret, provider, sender_number, trx_id, amount, timestamp } = body

        // ── Validation ──
        if (!store_id || !trx_id || !amount) {
            return NextResponse.json(
                { error: "Missing required fields: store_id, trx_id, amount" },
                { status: 400 }
            )
        }

        // Verify the seller exists
        const { data: seller, error: sellerErr } = await supabase
            .from("sellers")
            .select("id, settings")
            .eq("id", store_id)
            .single()

        if (sellerErr || !seller) {
            return NextResponse.json({ error: "Invalid store_id" }, { status: 404 })
        }

        // Optional: verify app_secret matches seller's stored secret
        // if (seller.settings?.ruxspeed_secret && seller.settings.ruxspeed_secret !== app_secret) {
        //     return NextResponse.json({ error: "Invalid app_secret" }, { status: 403 })
        // }

        // ── Step 1: Save to sms_transactions ──
        const { data: smsRecord, error: smsErr } = await supabase
            .from("sms_transactions")
            .upsert(
                {
                    seller_id: store_id,
                    trx_id: trx_id.trim().toUpperCase(),
                    amount: Number(amount),
                    sender_number: sender_number || null,
                    provider: provider || "bKash",
                    is_used: false,
                },
                { onConflict: "seller_id,trx_id" }
            )
            .select()
            .single()

        if (smsErr) {
            console.error("SMS Transaction save error:", smsErr)
            return NextResponse.json({ error: "Failed to save SMS transaction" }, { status: 500 })
        }

        // ── Step 2: Find matching pending order ──
        const { data: matchingOrder, error: orderErr } = await supabase
            .from("orders")
            .select("id, order_number, total, delivery_charge, subtotal, status, advance_paid, due_amount")
            .eq("seller_id", store_id)
            .eq("provided_trx_id", trx_id.trim().toUpperCase())
            .in("status", ["payment_pending", "pending"])
            .limit(1)
            .single()

        if (orderErr || !matchingOrder) {
            // No matching order found — SMS is saved for future manual matching
            return NextResponse.json({
                success: true,
                matched: false,
                message: "SMS transaction saved. No matching pending order found yet.",
                sms_id: smsRecord.id,
            })
        }

        // ── Step 3: Verify amount ──
        const expectedAmount = matchingOrder.delivery_charge || 0
        const paidAmount = Number(amount)

        if (paidAmount < expectedAmount) {
            // Amount mismatch — flag it but don't auto-verify
            await supabase
                .from("orders")
                .update({
                    advance_paid: paidAmount,
                    due_amount: (matchingOrder.total || 0) - paidAmount,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", matchingOrder.id)

            return NextResponse.json({
                success: true,
                matched: true,
                verified: false,
                message: `Amount mismatch: expected ৳${expectedAmount}, received ৳${paidAmount}. Flagged for manual review.`,
                order_number: matchingOrder.order_number,
            })
        }

        // ── Step 4: Auto-verify the order ──
        const totalBill = matchingOrder.total || 0
        const dueAmount = Math.max(0, totalBill - paidAmount)

        await supabase
            .from("orders")
            .update({
                status: "verified",
                advance_paid: paidAmount,
                due_amount: dueAmount,
                updated_at: new Date().toISOString(),
            })
            .eq("id", matchingOrder.id)

        // Mark SMS transaction as used
        await supabase
            .from("sms_transactions")
            .update({ is_used: true })
            .eq("id", smsRecord.id)

        return NextResponse.json({
            success: true,
            matched: true,
            verified: true,
            message: `Order ${matchingOrder.order_number} verified! Due amount: ৳${dueAmount}`,
            order_number: matchingOrder.order_number,
            advance_paid: paidAmount,
            due_amount: dueAmount,
        })
    } catch (error: any) {
        console.error("RuxSpeed Webhook Error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
