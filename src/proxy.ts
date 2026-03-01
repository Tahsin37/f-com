import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@supabase/supabase-js"

// Simple in-memory rate limiter (works per-instance, not globally)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000  // 1 minute
const RATE_LIMIT_MAX = 30            // max requests per window for API routes
const CHECKOUT_LIMIT_MAX = 5         // checkout submissions per window

function getClientIP(req: NextRequest): string {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
}

function checkRateLimit(key: string, maxRequests: number): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
        return true
    }

    if (entry.count >= maxRequests) return false
    entry.count++
    return true
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetTime) rateLimitMap.delete(key)
    }
}, 5 * 60 * 1000)

export default async function proxy(req: NextRequest) {
    const url = req.nextUrl
    const { pathname } = url

    // Only rate limit API routes
    if (pathname.startsWith("/api/")) {
        const ip = getClientIP(req)
        const isCheckout = pathname.includes("/checkout") || pathname.includes("/orders")
        const limit = isCheckout ? CHECKOUT_LIMIT_MAX : RATE_LIMIT_MAX
        const key = `${ip}:${isCheckout ? "checkout" : "api"}`

        if (!checkRateLimit(key, limit)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": "60" } }
            )
        }
    }

    // Custom Domain Routing
    const hostname = req.headers.get("host") || ""
    // Define what your root app domain is (ex. localhost:3000, fmanager.app, etc)
    const isAppDomain = hostname.includes("localhost") || hostname.includes("vercel.app") || hostname.includes("fmanager.app")

    if (!pathname.startsWith("/api/") && !pathname.startsWith("/_next/") && !isAppDomain) {
        // Query database to find if this custom domain exists and is verified
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Find the domain and the associated seller's slug
        const { data: domainData } = await supabase
            .from("domains")
            .select("verified, sellers!inner(slug)")
            .eq("domain", hostname.replace(/:\d+$/, "")) // Strip port if present
            .single()

        const sellerData = domainData?.sellers as any

        if (domainData?.verified && sellerData?.slug) {
            // Rewrite the request to the seller's storefront
            // Example: customdomain.com/product/123 -> /store/seller-slug/product/123
            let rewritePath = `/store/${sellerData.slug}${pathname === "/" ? "" : pathname}`
            // Prevent double proxying if pathname somehow already includes /store/
            if (pathname.startsWith(`/store/`)) {
                rewritePath = pathname
            }
            const rewriteUrl = new URL(rewritePath, req.url)
            // Preserve search params
            rewriteUrl.search = url.search
            return NextResponse.rewrite(rewriteUrl)
        }
    }

    // Security headers for all responses
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    return response
}

export const config = {
    matcher: ["/api/:path*", "/store/:path*", "/dashboard/:path*"],
}
