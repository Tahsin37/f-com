// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager HTML→Theme Parser
// Accepts raw HTML + CSS and produces a validated ThemeJSON
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeJSON, ThemeTokenColors, HeroLayout, CardStyleVariant } from './types'
import { sanitizeCSS } from './css-sanitizer'
import { validateThemeJSON } from './schema'

// ─── Result ────────────────────────────────────────────────────────────────────

export interface ParseResult {
    success: boolean
    theme: ThemeJSON | null
    riskScore: number
    errors: string[]
    warnings: string[]
    blocked: string[]
}

// ─── HTML Sanitizer ────────────────────────────────────────────────────────────

function sanitizeHTML(html: string): string {
    // Strip <script> tags
    let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Strip <iframe> tags
    clean = clean.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // Strip on* event attributes
    clean = clean.replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
    clean = clean.replace(/\s+on\w+\s*=\s*\S+/gi, '')
    // Strip <form action> pointing to external domains
    clean = clean.replace(/<form[^>]*action\s*=\s*(['"])(https?:\/\/[^'"]*)\1[^>]*>/gi,
        '<form>')
    // Strip <object>, <embed>, <applet>
    clean = clean.replace(/<(object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi, '')
    return clean
}

// ─── Color Extraction ──────────────────────────────────────────────────────────

const HEX_COLOR_REGEX = /#([0-9a-fA-F]{3,8})\b/g
const RGB_REGEX = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g
const HSL_REGEX = /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/g

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color)
    }
    return rgbToHex(f(0), f(8), f(4))
}

function extractAllColors(text: string): string[] {
    const colors: string[] = []

    // Hex colors
    let m: RegExpExecArray | null
    const hexRe = new RegExp(HEX_COLOR_REGEX.source, 'g')
    while ((m = hexRe.exec(text)) !== null) {
        let hex = m[1]
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
        colors.push('#' + hex.toUpperCase())
    }

    // RGB
    const rgbRe = new RegExp(RGB_REGEX.source, 'g')
    while ((m = rgbRe.exec(text)) !== null) {
        colors.push(rgbToHex(+m[1], +m[2], +m[3]).toUpperCase())
    }

    // HSL
    const hslRe = new RegExp(HSL_REGEX.source, 'g')
    while ((m = hslRe.exec(text)) !== null) {
        colors.push(hslToHex(+m[1], +m[2], +m[3]).toUpperCase())
    }

    return colors
}

// Simple frequency-based "dominant color" selection
function pickDominantColors(colors: string[]): ThemeTokenColors {
    const freq: Record<string, number> = {}
    for (const c of colors) {
        freq[c] = (freq[c] || 0) + 1
    }

    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([c]) => c)
        .filter(c => c !== '#FFFFFF' && c !== '#000000' && c !== '#FFF' && c !== '#000')

    return {
        primary: sorted[0] || '#0EA5A4',
        accent: sorted[1] || '#FFD166',
        bg: '#FFFFFF',
        text: sorted.find(c => isColorDark(c)) || '#0F172A',
        muted: sorted[2] || '#94A3B8',
    }
}

function isColorDark(hex: string): boolean {
    const c = hex.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum < 0.5
}

// ─── Font Extraction ───────────────────────────────────────────────────────────

function extractFonts(css: string): { heading: string; body: string } {
    const fontFamilies: string[] = []
    const re = /font-family\s*:\s*([^;]+)/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(css)) !== null) {
        fontFamilies.push(m[1].trim())
    }

    return {
        heading: fontFamilies[0] || "'Space Grotesk', system-ui, sans-serif",
        body: fontFamilies[1] || fontFamilies[0] || "'Noto Sans Bengali', system-ui, sans-serif",
    }
}

// ─── Border Radius Extraction ──────────────────────────────────────────────────

function extractRadii(css: string): { card: string; button: string } {
    const re = /border-radius\s*:\s*([^;]+)/gi
    const radii: string[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(css)) !== null) {
        radii.push(m[1].trim().split(/\s+/)[0])
    }

    return {
        card: radii[0] || '1rem',
        button: radii.find(r => r.includes('9999') || r.includes('999')) || '9999px',
    }
}

// ─── Section Detection ─────────────────────────────────────────────────────────

function detectHeroLayout(html: string): HeroLayout {
    const lower = html.toLowerCase()
    if (lower.includes('carousel') || lower.includes('slider') || lower.includes('swiper')) return 'carousel'
    if (lower.includes('split') || lower.includes('two-column')) return 'split'
    if (lower.includes('full-width') || lower.includes('fullwidth')) return 'full-width-bg'
    if (lower.includes('minimal')) return 'minimal'
    return 'centered-image-right'
}

function detectCardStyle(css: string): CardStyleVariant {
    const lower = css.toLowerCase()
    if (lower.includes('box-shadow') && lower.includes('border-radius')) return 'rounded-shadow'
    if (lower.includes('box-shadow')) return 'elevated'
    if (lower.includes('border:') || lower.includes('border-width')) return 'bordered'
    if (lower.includes('border-radius')) return 'rounded-shadow'
    return 'flat'
}

function detectGridColumns(html: string, css: string): 1 | 2 | 3 | 4 {
    const combined = html + css
    if (/grid-template-columns\s*:.*repeat\s*\(\s*4/i.test(combined)) return 4
    if (/grid-template-columns\s*:.*repeat\s*\(\s*3/i.test(combined)) return 3
    if (/grid-template-columns\s*:.*repeat\s*\(\s*2/i.test(combined)) return 2
    if (/columns-3|col-3|grid-cols-3/i.test(combined)) return 3
    if (/columns-4|col-4|grid-cols-4/i.test(combined)) return 4
    return 2
}

// ─── Asset Extraction ──────────────────────────────────────────────────────────

function extractAssets(html: string, css: string): Record<string, string> {
    const assets: Record<string, string> = {}
    const imgRe = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/gi
    let m: RegExpExecArray | null

    const images: string[] = []
    while ((m = imgRe.exec(html)) !== null) {
        images.push(m[1])
    }

    // Background images
    const bgRe = /background(?:-image)?\s*:\s*url\s*\(\s*['"]?([^'")]+)/gi
    while ((m = bgRe.exec(css + html)) !== null) {
        images.push(m[1])
    }

    if (images.length > 0) assets.heroImage = images[0]
    if (images.length > 1) assets.logo = images[1]

    return assets
}

// ─── Has JavaScript ────────────────────────────────────────────────────────────

function detectJavaScript(html: string): boolean {
    return /<script/i.test(html) || /on\w+\s*=/i.test(html)
}

// ─── Main Parser ───────────────────────────────────────────────────────────────

export function parseHTMLToTheme(
    rawHTML: string,
    rawCSS: string = '',
    options: { themeId?: string; themeName?: string; author?: string } = {}
): ParseResult {
    const errors: string[] = []
    const warnings: string[] = []
    let riskScore = 0

    // Check for JS
    const hasJS = detectJavaScript(rawHTML)
    if (hasJS) {
        warnings.push('JavaScript detected in HTML — stripped and flagged for review')
        riskScore += 40
    }

    // Sanitize HTML
    const cleanHTML = sanitizeHTML(rawHTML)

    // Sanitize CSS
    const cssResult = sanitizeCSS(rawCSS)
    riskScore += cssResult.riskScore
    warnings.push(...cssResult.warnings)

    // Extract tokens
    const allText = cleanHTML + cssResult.css
    const colors = extractAllColors(allText)
    const tokenColors = pickDominantColors(colors)
    const fonts = extractFonts(cssResult.css)
    const radii = extractRadii(cssResult.css)

    // Detect components
    const heroLayout = detectHeroLayout(cleanHTML)
    const cardStyle = detectCardStyle(cssResult.css)
    const columns = detectGridColumns(cleanHTML, cssResult.css)

    // Extract assets
    const assets = extractAssets(cleanHTML, cssResult.css)

    // Build ThemeJSON
    const themeId = options.themeId || `imported-${Date.now()}`
    const theme: ThemeJSON = {
        id: themeId,
        name: options.themeName || 'Imported Theme',
        author: options.author || 'Import',
        version: '1.0.0',
        tokens: {
            colors: tokenColors,
            fonts,
            radii,
            spacings: { container: '1200px', gap: '1.25rem' },
        },
        components: {
            hero: { layout: heroLayout, buttonStyle: 'primary-filled' },
            productGrid: { columns, cardStyle },
        },
        assets,
        safeCSS: cssResult.css,
    }

    // Validate
    const validation = validateThemeJSON(theme)
    if (!validation.valid) {
        errors.push(...validation.errors)
    }
    warnings.push(...validation.warnings)

    return {
        success: validation.valid,
        theme: validation.valid ? theme : null,
        riskScore: Math.min(riskScore, 100),
        errors,
        warnings,
        blocked: cssResult.blocked,
    }
}
