/**
 * Sanitize an image URL:
 * - Valid HTTP(S) URLs pass through unchanged
 * - Base64 strings with proper data: prefix pass through (if not oversized)
 * - Raw base64 strings (no prefix) get data:image/png;base64, prepended (if not oversized)
 * - Oversized base64 (>100KB) are rejected to avoid ERR_INVALID_URL 
 * - Empty/invalid strings return empty string (renders placeholder)
 */

const MAX_BASE64_LENGTH = 100_000 // ~75KB of image data

export function sanitizeImageUrl(url: string | undefined | null): string {
    if (!url || typeof url !== "string") return ""
    const trimmed = url.trim()
    if (!trimmed) return ""

    // Already a proper HTTP URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed

    // Blob URL
    if (trimmed.startsWith("blob:")) return trimmed

    // Relative URL (e.g. /images/product.jpg)
    if (trimmed.startsWith("/")) return trimmed

    // Data URI — check if it's not too large
    if (trimmed.startsWith("data:")) {
        if (trimmed.length > MAX_BASE64_LENGTH) return "" // too large — skip
        return trimmed
    }

    // Looks like raw base64 (starts with typical base64 chars, long enough)
    if (/^[A-Za-z0-9+/]/.test(trimmed) && trimmed.length > 100) {
        if (trimmed.length > MAX_BASE64_LENGTH) return "" // too large — skip
        return `data:image/png;base64,${trimmed}`
    }

    // Unknown format — return empty to show placeholder
    return ""
}

/**
 * Sanitize an array of image URLs
 */
export function sanitizeImageUrls(urls: (string | undefined | null)[]): string[] {
    return (urls || []).map(sanitizeImageUrl).filter(Boolean)
}
