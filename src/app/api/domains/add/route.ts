import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { sellerId, domain } = body

        if (!sellerId || !domain) {
            return NextResponse.json({ error: "Missing sellerId or domain" }, { status: 400 })
        }

        const normalizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")

        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalizedDomain)) {
            return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
        }

        // Check if domain already exists
        const { data: existing } = await supabase
            .from("domains")
            .select("id")
            .eq("domain", normalizedDomain)
            .single()

        if (existing) {
            return NextResponse.json({ error: "Domain is already registered to another store" }, { status: 400 })
        }

        // Generate unique TXT record for verification
        const token = `fmanager-verify=${crypto.randomUUID()}`

        // Insert into database
        const { error } = await supabase
            .from("domains")
            .insert({
                seller_id: sellerId,
                domain: normalizedDomain,
                verification_token: token,
                verified: false,
            })

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            domain: normalizedDomain,
            txt_record: token,
            status: "pending"
        })

    } catch (error: any) {
        console.error("Domain Add Error:", error)
        return NextResponse.json({ error: "Failed to add domain. Please try again." }, { status: 500 })
    }
}
