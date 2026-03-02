import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { product_id, seller_id, customer_name, rating, comment, order_id } = body

        if (!product_id || !seller_id || !customer_name || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
        }

        let verifiedOrderId = null

        // If order_id is provided, verify it actually belongs to this product and customer
        if (order_id) {
            const { data: orderData } = await supabase
                .from("orders")
                .select("id, status")
                .eq("id", order_id)
                .eq("seller_id", seller_id)
                // In a real app we might verify the customer_phone matches the logged-in user if we had customer auth,
                // or just check that the order contains the product_id.
                .in("status", ["delivered", "shipped"])
                .single()

            if (orderData) {
                // Check if the order actually contains this product
                const { data: items } = await supabase
                    .from("order_items")
                    .select("id")
                    .eq("order_id", orderData.id)
                    .eq("product_id", product_id)
                    .limit(1)

                if (items && items.length > 0) {
                    verifiedOrderId = orderData.id
                }
            }
        }

        // Insert review
        const { data, error } = await supabase
            .from("reviews")
            .insert({
                product_id,
                seller_id,
                customer_name,
                rating,
                comment: comment?.trim() || null,
                order_id: verifiedOrderId,
                is_published: true // By default, auto-publish. Sellers can hide it later.
            })
            .select()
            .single()

        if (error) {
            console.error("Review insert error:", error)
            return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
        }

        return NextResponse.json({ success: true, data }, { status: 201 })
    } catch (err: any) {
        console.error("POST /api/reviews error:", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
