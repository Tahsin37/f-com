import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * Courier Booking — Steadfast API Integration
 *
 * POST /api/courier/book
 * Body: { orderId }
 *
 * The endpoint fetches order details, calculates the exact cod_amount
 * using the formula: cod_amount = total_bill - advance_paid (due_amount),
 * then books the parcel via Steadfast's API.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orderId } = body

        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
        }

        // Fetch order + seller details
        const { data: order, error: orderErr } = await supabase
            .from("orders")
            .select("*, seller:sellers(id, name, api_keys, settings)")
            .eq("id", orderId)
            .single()

        if (orderErr || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const seller = order.seller as any
        const apiKeys = seller?.api_keys || {}
        const steadfastKey = apiKeys.steadfast_key
        const steadfastSecret = apiKeys.steadfast_secret

        if (!steadfastKey || !steadfastSecret) {
            return NextResponse.json({
                error: "Courier API keys not configured. Go to Dashboard → Settings and add your Steadfast API Key & Secret to enable parcel booking.",
            }, { status: 400 })
        }

        // ── Calculate COD Amount (THE CRITICAL MATH) ──
        // cod_amount = total_bill - advance_paid = due_amount
        const codAmount = order.due_amount ?? (order.total - (order.advance_paid || 0))

        // ── Build Steadfast API payload ──
        const payload = {
            invoice: order.order_number,
            recipient_name: order.customer_name,
            recipient_phone: order.customer_phone,
            recipient_address: order.customer_address,
            cod_amount: codAmount,
            note: `F-Manager Order ${order.order_number} | Advance: ৳${order.advance_paid || 0}`,
        }

        // ── Call Steadfast API ──
        const steadfastRes = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": steadfastKey,
                "Secret-Key": steadfastSecret,
            },
            body: JSON.stringify(payload),
        })

        const steadfastData = await steadfastRes.json()

        if (!steadfastRes.ok || steadfastData.status !== 200) {
            console.error("Steadfast API Error:", steadfastData)
            return NextResponse.json({
                error: steadfastData.message || "Steadfast booking failed",
                details: steadfastData.errors || null,
            }, { status: 400 })
        }

        // ── Update order with tracking info ──
        const consignment = steadfastData.consignment || {}

        await supabase
            .from("orders")
            .update({
                status: "shipped",
                courier_tracking_id: consignment.tracking_code || null,
                courier_consignment_id: consignment.consignment_id || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)

        // Add tracking entry
        try {
            await supabase.from("order_tracking").insert({
                order_id: orderId,
                status: "shipped",
                note: `Booked via Steadfast — Tracking: ${consignment.tracking_code || "N/A"}`,
            })
        } catch { /* tracking table may not exist */ }

        return NextResponse.json({
            success: true,
            bookingId: consignment.consignment_id,
            awb: consignment.tracking_code,
            courier: "steadfast",
            status: "PENDING_PICKUP",
            cod_amount: codAmount,
            message: `Parcel booked! COD Amount: ৳${codAmount} (Advance ৳${order.advance_paid || 0} already collected)`,
        })
    } catch (error: any) {
        console.error("Courier booking error:", error)
        return NextResponse.json({ error: "Courier booking failed" }, { status: 500 })
    }
}
