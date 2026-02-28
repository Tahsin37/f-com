import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { sellerId, items, customer, payment, deliveryArea } = body

        if (!items?.length || !customer?.phone || !customer?.name || !customer?.address) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check blacklist
        const { data: blacklisted } = await supabase
            .from("blacklist")
            .select("id")
            .eq("phone", customer.phone)
            .limit(1)

        const isBlacklisted = (blacklisted?.length ?? 0) > 0

        // Generate order number + OTP
        const orderNumber = `FM-${Math.floor(10000 + Math.random() * 90000)}`
        const otpCode = String(Math.floor(1000 + Math.random() * 9000))

        const deliveryCharge = deliveryArea === "outside" ? 120 : 60
        const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
        const total = subtotal + deliveryCharge

        // Insert order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                order_number: orderNumber,
                seller_id: sellerId || "a0000000-0000-0000-0000-000000000001",
                customer_name: customer.name,
                customer_phone: customer.phone,
                customer_address: customer.address,
                delivery_area: deliveryArea || "dhaka",
                delivery_charge: deliveryCharge,
                subtotal,
                total,
                payment_method: payment?.method || "cod",
                trx_id: payment?.trxId || null,
                otp_code: otpCode,
                status: "pending",
            })
            .select("id, order_number")
            .single()

        if (orderError) throw orderError

        // Insert order items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId || item.id,
            variant_id: item.variantId || null,
            product_name: item.name,
            variant_label: item.variantLabel || null,
            quantity: item.quantity,
            unit_price: item.price,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
        if (itemsError) throw itemsError

        // Deduct stock for each item
        for (const item of items) {
            if (item.variantId) {
                // Deduct from variant stock
                const { data: variant } = await supabase
                    .from("variants")
                    .select("stock")
                    .eq("id", item.variantId)
                    .single()
                if (variant) {
                    await supabase
                        .from("variants")
                        .update({ stock: Math.max(0, variant.stock - item.quantity) })
                        .eq("id", item.variantId)
                }
            } else if (item.productId || item.id) {
                // Deduct from product stock
                const pid = item.productId || item.id
                const { data: product } = await supabase
                    .from("products")
                    .select("stock")
                    .eq("id", pid)
                    .single()
                if (product) {
                    await supabase
                        .from("products")
                        .update({ stock: Math.max(0, product.stock - item.quantity) })
                        .eq("id", pid)
                }
            }
        }

        return NextResponse.json({
            orderId: order.order_number,
            orderUUID: order.id,
            status: "OTP_REQUIRED",
            otpSent: true,
            isBlacklisted,
            message: `OTP sent to ${customer.phone} (demo: ${otpCode})`,
            // In production, send OTP via SMS. For demo, return it.
            _demoOtp: otpCode,
        })
    } catch (error: any) {
        console.error("Order error:", error)
        return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
    }
}
