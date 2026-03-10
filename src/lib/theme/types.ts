// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager Theme System — Types & Schema
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Theme JSON (strict schema) ────────────────────────────────────────────────

export interface ThemeTokenColors {
    primary: string   // hex
    accent: string    // hex
    bg: string        // hex
    text: string      // hex
    muted: string     // hex
}

export interface ThemeTokenFonts {
    heading: string   // CSS font stack
    body: string      // CSS font stack
}

export interface ThemeTokenRadii {
    card: string      // px or rem
    button: string    // px or rem
}

export interface ThemeTokenSpacings {
    container: string // px or rem
    gap: string       // px or rem
}

export interface ThemeTokens {
    colors: ThemeTokenColors
    fonts: ThemeTokenFonts
    radii: ThemeTokenRadii
    spacings: ThemeTokenSpacings
}

export type HeroLayout = 'centered-image-right' | 'full-width-bg' | 'split' | 'minimal' | 'carousel'
export type ButtonStyleVariant = 'primary-filled' | 'primary-outline' | 'rounded-pill' | 'square'
export type CardStyleVariant = 'rounded-shadow' | 'flat' | 'bordered' | 'minimal' | 'elevated'
export type ProductGridColumns = 1 | 2 | 3 | 4

export interface ThemeComponentHero {
    layout: HeroLayout
    buttonStyle: ButtonStyleVariant
    overlay?: string
}

export interface ThemeComponentProductGrid {
    columns: ProductGridColumns
    cardStyle: CardStyleVariant
}

export interface ThemeComponents {
    hero: ThemeComponentHero
    productGrid: ThemeComponentProductGrid
    [key: string]: unknown
}

export interface ThemeAssets {
    logo?: string       // URL
    heroImage?: string  // URL
    [key: string]: string | undefined
}

export interface ThemeJSON {
    id: string          // kebab-case
    name: string
    author: string
    previewImage?: string
    version: string     // semver
    tokens: ThemeTokens
    components: ThemeComponents
    assets: ThemeAssets
    safeCSS?: string
}

// ─── Theme Status ──────────────────────────────────────────────────────────────

export type ThemeStatus = 'draft' | 'active' | 'pending_review' | 'rejected' | 'approved'
export type ThemeSource = 'manual' | 'import_json' | 'import_html' | 'import_zip' | 'ai_generated'

// ─── Theme DB row ──────────────────────────────────────────────────────────────

export interface ThemeRow {
    id: string
    seller_id: string
    name: string
    slug: string
    author: string
    version: string
    preview_image: string | null
    tokens: ThemeTokens
    components: ThemeComponents
    assets: ThemeAssets
    safe_css: string
    status: ThemeStatus
    risk_score: number
    source: ThemeSource
    created_at: string
    updated_at: string
}

// ─── Theme History row ─────────────────────────────────────────────────────────

export interface ThemeHistoryRow {
    id: string
    seller_id: string
    theme_id: string
    action: 'applied' | 'reverted' | 'updated'
    snapshot: Record<string, unknown>
    applied_at: string
    reverted_at: string | null
}

// ─── Audit Log row ─────────────────────────────────────────────────────────────

export interface AuditLogRow {
    id: string
    seller_id: string | null
    user_id: string | null
    action: string
    resource: string | null
    metadata: Record<string, unknown>
    ip: string | null
    created_at: string
}
