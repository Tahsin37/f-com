import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orderId, courier, pickupAddress, weightEstimate } = body

        if (!orderId || !courier) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Mock Booking
        const bookingId = `SF-${Math.floor(Math.random() * 100000)}`
        const awb = `AWB${Math.floor(Math.random() * 100000000)}`

        return NextResponse.json({
            success: true,
            bookingId,
            awb,
            courier,
            status: "PENDING_PICKUP",
            message: `Consignment created successfully via ${courier}`
        })
    } catch (error) {
        return NextResponse.json({ error: "Courier booking failed" }, { status: 500 })
    }
}
