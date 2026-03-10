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

    // Domain Parsing Logic
    const hostname = req.headers.get("host") || ""
    const currentHost = hostname.replace(/:\d+$/, "") // Strip port if present

    // Define root domains that host the SAAS
    const rootDomains = ["localhost", "127.0.0.1", "f-manager.com", "fmanager.app"]
    const isRootRequest = rootDomains.includes(currentHost) || currentHost.endsWith(".vercel.app")

    // Bypass middleware for Next.js internals, APIs
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
        return NextResponse.next()
    }

    // Block direct access to /store/... on root domains (force using subdomains)
    if (isRootRequest && pathname.startsWith("/store/")) {
        const parts = pathname.split('/').filter(Boolean)
        const slug = parts[1] // e.g. /store/sifr-style -> parts = ['store', 'sifr-style']
        if (slug) {
            const protocol = currentHost.includes("localhost") ? "http" : "https"
            // Replace the root domain in the hostname with the subdomain (preserving port)
            const hostWithPort = hostname.replace(currentHost, `${slug}.${currentHost}`)
            const newPath = '/' + parts.slice(2).join('/')
            return NextResponse.redirect(`${protocol}://${hostWithPort}${newPath}${url.search}`)
        }
        return NextResponse.redirect(new URL("/", req.url))
    }

    if (isRootRequest) {
        return NextResponse.next()
    }

    // Determine if this is a wildcard subdomain of a root domain (e.g., mystore.localhost)
    let isWildcardSubdomain = false
    let extractedSlug = ""

    for (const root of rootDomains) {
        if (currentHost.endsWith(`.${root}`)) {
            isWildcardSubdomain = true
            extractedSlug = currentHost.replace(`.${root}`, "")
            break
        }
    }

    // --- Security Headers Formulation ---
    const getSecurityHeaders = () => {
        const headers = new Headers()
        headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
        headers.set("X-Content-Type-Options", "nosniff")
        headers.set("X-Frame-Options", "DENY")
        headers.set("X-XSS-Protection", "1; mode=block")
        headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

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
        headers.set("Content-Security-Policy", cspHeader)
        return headers
    }

    // 1. Handle Wildcard Subdomains (No DB hit required if we just rewrite)
    if (isWildcardSubdomain && extractedSlug !== "www" && extractedSlug !== "app") {
        let rewritePath = `/store/${extractedSlug}${pathname === "/" ? "" : pathname}`
        // prevent double rewrite loop if already visiting /store/...
        if (pathname.startsWith(`/store/`)) {
            rewritePath = pathname
        }

        // Use the existing nextUrl to preserve internal routing properties
        url.pathname = rewritePath
        console.log(`[Middleware] Rewriting wildcard ${currentHost} to ${url.pathname}`)

        const rewriteResponse = NextResponse.rewrite(url)
        const securityHeaders = getSecurityHeaders()
        securityHeaders.forEach((value, key) => rewriteResponse.headers.set(key, value))

        return rewriteResponse
    }

    // 2. Handle Custom Domains (Requires DB hit to find the associated store slug)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Find the domain and the associated seller's slug
    const { data: domainData } = await supabase
        .from("domains")
        .select("verified, sellers!inner(slug)")
        .eq("domain", currentHost)
        .single()

    const sellerData = domainData?.sellers as any

    if (domainData?.verified && sellerData?.slug) {
        let rewritePath = `/store/${sellerData.slug}${pathname === "/" ? "" : pathname}`
        if (pathname.startsWith(`/store/`)) {
            rewritePath = pathname
        }
        const rewriteUrl = new URL(rewritePath, req.url)
        rewriteUrl.search = url.search

        const rewriteResponse = NextResponse.rewrite(rewriteUrl)
        const securityHeaders = getSecurityHeaders()
        securityHeaders.forEach((value, key) => rewriteResponse.headers.set(key, value))

        return rewriteResponse
    }

    // Default passthrough if no custom domain mapped
    const defaultResponse = NextResponse.next()
    const securityHeaders = getSecurityHeaders()
    securityHeaders.forEach((value, key) => defaultResponse.headers.set(key, value))

    return defaultResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth/callback (Supabase auth callback)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public images/assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
