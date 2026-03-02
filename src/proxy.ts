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

        // Security headers for all responses
        const response = NextResponse.next()

        // Strict Transport Security (HSTS) - Enforce HTTPS
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

        // X-Content-Type-Options - Prevent MIME-type sniffing
        response.headers.set("X-Content-Type-Options", "nosniff")

        // X-Frame-Options - Prevent clickjacking
        response.headers.set("X-Frame-Options", "DENY")

        // X-XSS-Protection - Legacy XSS filter fallback
        response.headers.set("X-XSS-Protection", "1; mode=block")

        // Referrer-Policy - Control referrer information sent
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

        // Content-Security-Policy (CSP) - Mitigate XSS and data injection
        // Note: 'unsafe-inline' and 'unsafe-eval' are often required by Next.js in dev/build, consider refining for strict prod
        const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel-scripts.com https://*.vercel-insights.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://*.supabase.co;
      frame-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()

        response.headers.set("Content-Security-Policy", cspHeader)

        // Append headers to rewrites as well if a custom domain was matched
        if (domainData?.verified && sellerData?.slug) {
            let rewritePath = `/store/${sellerData.slug}${pathname === "/" ? "" : pathname}`
            if (pathname.startsWith(`/store/`)) {
                rewritePath = pathname
            }
            const rewriteUrl = new URL(rewritePath, req.url)
            rewriteUrl.search = url.search

            const rewriteResponse = NextResponse.rewrite(rewriteUrl)
            // Copy security headers to the rewrite response
            rewriteResponse.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
            rewriteResponse.headers.set("X-Content-Type-Options", "nosniff")
            rewriteResponse.headers.set("X-Frame-Options", "DENY")
            rewriteResponse.headers.set("X-XSS-Protection", "1; mode=block")
            rewriteResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
            rewriteResponse.headers.set("Content-Security-Policy", cspHeader)

            return rewriteResponse
        }

        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/api/:path*", "/store/:path*", "/dashboard/:path*"],
}
