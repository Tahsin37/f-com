import { NextResponse } from "next/server"
import dns from "node:dns/promises"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const domain = searchParams.get("domain")
    const sellerId = searchParams.get("seller_id")

    if (!domain || !sellerId) {
        return NextResponse.json({ error: "Missing domain or seller_id" }, { status: 400 })
    }

    try {
        // Look up the domain in database
        const { data: domainData, error } = await supabase
            .from("domains")
            .select("*")
            .eq("domain", domain)
            .eq("seller_id", sellerId)
            .single()

        if (error || !domainData) {
            return NextResponse.json({ error: "Domain tracking record not found" }, { status: 404 })
        }

        if (domainData.verified) {
            return NextResponse.json({
                verified: true,
                domain,
                message: "Domain is already verified"
            })
        }

        const expectedRecord = domainData.verification_token

        // Real DNS TXT lookup on _fmanager subdomain
        const records = await dns.resolveTxt(`_fmanager.${domain}`)
        const flatRecords = records.flat()
        const verified = flatRecords.some(r => r === expectedRecord)

        if (verified) {
            // Update database to mark as verified
            await supabase
                .from("domains")
                .update({
                    verified: true,
                    verified_at: new Date().toISOString()
                })
                .eq("id", domainData.id)

            return NextResponse.json({
                verified: true,
                domain,
                message: "DNS record verified successfully"
            })
        } else {
            return NextResponse.json({
                verified: false,
                domain,
                message: `TXT record not found.Expected: ${expectedRecord} at _fmanager.${domain} `,
            })
        }
    } catch (err: any) {
        // DNS lookup failed — record doesn't exist yet
        return NextResponse.json({
            verified: false,
            domain,
            message: `DNS lookup failed for _fmanager.${domain}.Make sure you added the TXT record.DNS changes can take up to 48 hours.`,
        })
    }
}
