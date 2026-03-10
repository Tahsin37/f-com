// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager CSS Sanitizer
// Strips dangerous CSS patterns and returns sanitized output + risk score
// ═══════════════════════════════════════════════════════════════════════════════

export interface SanitizeResult {
    css: string
    riskScore: number          // 0–100
    warnings: string[]
    blocked: string[]
}

// Whitelisted font hosts
const ALLOWED_FONT_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'fonts.bunny.net',
]

// Whitelisted selectors for position:fixed
const FIXED_POSITION_WHITELIST = [
    '.toast', '.notification', '.snackbar', '.cookie-banner',
]

// ─── Main Sanitizer ────────────────────────────────────────────────────────────

export function sanitizeCSS(rawCSS: string): SanitizeResult {
    const warnings: string[] = []
    const blocked: string[] = []
    let riskScore = 0
    let css = rawCSS

    // 1. Strip @import rules (except whitelisted Google Fonts)
    css = css.replace(/@import\s+(?:url\()?['"]?([^'");\s]+)['"]?\)?[^;]*;?/gi, (match, url) => {
        try {
            const host = new URL(url).hostname
            if (ALLOWED_FONT_HOSTS.some(h => host.endsWith(h))) {
                return match // allow Google Fonts
            }
        } catch { /* invalid URL */ }
        blocked.push(`Blocked @import: ${url}`)
        riskScore += 15
        return '/* [BLOCKED @import] */'
    })

    // 2. Block url(javascript:...)
    css = css.replace(/url\s*\(\s*['"]?\s*javascript\s*:[^)]*\)/gi, () => {
        blocked.push('Blocked url(javascript:...)')
        riskScore += 30
        return '/* [BLOCKED javascript URL] */'
    })

    // 3. Block expression(...)
    css = css.replace(/expression\s*\([^)]*\)/gi, () => {
        blocked.push('Blocked CSS expression()')
        riskScore += 25
        return '/* [BLOCKED expression] */'
    })

    // 4. Block -moz-binding
    css = css.replace(/-moz-binding\s*:[^;]+;?/gi, () => {
        blocked.push('Blocked -moz-binding')
        riskScore += 20
        return '/* [BLOCKED -moz-binding] */'
    })

    // 5. Block behavior: url(...)
    css = css.replace(/behavior\s*:\s*url\s*\([^)]*\)\s*;?/gi, () => {
        blocked.push('Blocked behavior:url()')
        riskScore += 25
        return '/* [BLOCKED behavior] */'
    })

    // 6. Block @font-face with external URLs (except whitelisted)
    css = css.replace(/@font-face\s*\{[^}]*\}/gi, (block) => {
        const urls = block.match(/url\s*\(['"]?([^'")]+)['"]?\)/gi) || []
        for (const urlMatch of urls) {
            const urlStr = urlMatch.replace(/url\s*\(['"]?|['"]?\)/gi, '')
            try {
                const host = new URL(urlStr).hostname
                if (!ALLOWED_FONT_HOSTS.some(h => host.endsWith(h))) {
                    blocked.push(`Blocked @font-face from unknown host: ${host}`)
                    riskScore += 10
                    return '/* [BLOCKED @font-face unknown host] */'
                }
            } catch {
                // relative URL, allow
            }
        }
        return block
    })

    // 7. Restrict position:fixed on body/html/global selectors
    css = css.replace(/((?:^|[}\s]))((?:body|html|\*|:root)\s*(?:[^{]*)?)\{([^}]*)\}/gi, (match, prefix, selector, body) => {
        if (/position\s*:\s*fixed/i.test(body)) {
            const isWhitelisted = FIXED_POSITION_WHITELIST.some(w => selector.includes(w))
            if (!isWhitelisted) {
                warnings.push(`Removed position:fixed from global selector: ${selector.trim()}`)
                riskScore += 5
                body = body.replace(/position\s*:\s*fixed\s*;?/gi, '/* [REMOVED position:fixed] */')
            }
        }
        return `${prefix}${selector}{${body}}`
    })

    // 8. Limit z-index to <= 9999
    css = css.replace(/z-index\s*:\s*(\d+)/gi, (match, val) => {
        const num = parseInt(val, 10)
        if (num > 9999) {
            warnings.push(`Capped z-index from ${num} to 9999`)
            riskScore += 2
            return 'z-index: 9999'
        }
        return match
    })

    // 9. Remove !important on body/html (abusive)
    css = css.replace(/((?:body|html|\*)\s*\{[^}]*?)!important/gi, (match) => {
        warnings.push('Removed !important from global selector')
        riskScore += 3
        return match.replace(/!important/gi, '')
    })

    // 10. Remove any HTML script tags that might have been embedded
    css = css.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, () => {
        blocked.push('Blocked <script> tag in CSS')
        riskScore += 30
        return '/* [BLOCKED script tag] */'
    })

    // 11. Block data: URIs (potential XSS vector)
    css = css.replace(/url\s*\(\s*['"]?\s*data\s*:\s*text\/html[^)]*\)/gi, () => {
        blocked.push('Blocked data:text/html URI')
        riskScore += 20
        return '/* [BLOCKED data URI] */'
    })

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100)

    return { css: css.trim(), riskScore, warnings, blocked }
}

// ─── Check if CSS is safe (risk below threshold) ──────────────────────────────

export function isCSSsafe(css: string, threshold = 20): boolean {
    const result = sanitizeCSS(css)
    return result.riskScore <= threshold
}
