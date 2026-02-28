import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
    try {
        const { orderId, otp } = await request.json()

        if (!orderId || !otp) {
            return NextResponse.json({ error: "Missing orderId or otp" }, { status: 400 })
        }

        // Find order by order_number
        const { data: order, error } = await supabase
            .from("orders")
            .select("id, otp_code, otp_verified")
            .eq("order_number", orderId)
            .single()

        if (error || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if (order.otp_verified) {
            return NextResponse.json({ success: true, message: "Already verified" })
        }

        if (order.otp_code !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
        }

        // Mark as verified + move to processing
        await supabase
            .from("orders")
            .update({ otp_verified: true, status: "processing", updated_at: new Date().toISOString() })
            .eq("id", order.id)

        return NextResponse.json({ success: true, message: "OTP verified! Order confirmed." })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
    }
}
