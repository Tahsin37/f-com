import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

        let subtotal = 0
        const verifiedItems = []

        // Verify prices and stock securely from database
        for (const item of items) {
            const pid = item.productId || item.id
            const quantity = parseInt(item.quantity) || 1

            if (quantity <= 0) {
                return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
            }

            if (item.variantId) {
                // Fetch variant price & stock
                const { data: variant, error: varErr } = await supabase
                    .from("variants")
                    .select("price_override, stock, label")
                    .eq("id", item.variantId)
                    .single()

                const { data: product } = await supabase
                    .from("products")
                    .select("selling_price, name, discount")
                    .eq("id", pid)
                    .single()

                if (varErr || !variant || !product) {
                    return NextResponse.json({ error: "Product or variant not found" }, { status: 404 })
                }

                if (variant.stock < quantity) {
                    return NextResponse.json({ error: `Not enough stock for ${product.name} - ${variant.label}` }, { status: 400 })
                }

                const basePrice = Number(variant.price_override || product.selling_price)
                const discountAmount = product.discount ? (basePrice * (Number(product.discount) / 100)) : 0
                const finalPrice = Math.max(0, basePrice - discountAmount)

                subtotal += finalPrice * quantity
                verifiedItems.push({
                    ...item,
                    name: product.name,
                    variantLabel: variant.label,
                    verifiedPrice: finalPrice
                })

            } else {
                // Fetch product price & stock
                const { data: product, error: prodErr } = await supabase
                    .from("products")
                    .select("selling_price, stock, name, discount")
                    .eq("id", pid)
                    .single()

                if (prodErr || !product) {
                    return NextResponse.json({ error: "Product not found" }, { status: 404 })
                }

                if (product.stock < quantity) {
                    return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
                }

                const basePrice = Number(product.selling_price)
                const discountAmount = product.discount ? (basePrice * (Number(product.discount) / 100)) : 0
                const finalPrice = Math.max(0, basePrice - discountAmount)

                subtotal += finalPrice * quantity
                verifiedItems.push({
                    ...item,
                    name: product.name,
                    variantLabel: null,
                    verifiedPrice: finalPrice
                })
            }
        }

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

        if (orderError) {
            console.error("Supabase Order Error:", orderError)
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
        }

        // Insert order items using verified prices
        const orderItems = verifiedItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId || item.id,
            variant_id: item.variantId || null,
            product_name: item.name,
            variant_label: item.variantLabel,
            quantity: item.quantity,
            unit_price: item.verifiedPrice,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
        if (itemsError) {
            console.error("Supabase Order Items Error:", itemsError)
            return NextResponse.json({ error: "Failed to create order items" }, { status: 500 })
        }

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
        return NextResponse.json({
            error: "An error occurred while processing your order. Please try again."
        }, { status: 500 })
    }
}
