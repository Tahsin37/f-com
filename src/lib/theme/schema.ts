// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager Theme JSON Schema Validator
// Uses a hand-rolled validator (no external deps) for strict ThemeJSON validation
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeJSON } from './types'

// ─── Validation Result ─────────────────────────────────────────────────────────

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

// ─── Allowed values ────────────────────────────────────────────────────────────

const HERO_LAYOUTS = ['centered-image-right', 'full-width-bg', 'split', 'minimal', 'carousel']
const BUTTON_STYLES = ['primary-filled', 'primary-outline', 'rounded-pill', 'square']
const CARD_STYLES = ['rounded-shadow', 'flat', 'bordered', 'minimal', 'elevated']
const GRID_COLUMNS = [1, 2, 3, 4]

// ─── Helpers ───────────────────────────────────────────────────────────────────

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const KEBAB_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/
const CSS_UNIT_REGEX = /^\d+(\.\d+)?(px|rem|em|%)$/

function isHex(v: unknown): v is string {
    return typeof v === 'string' && HEX_REGEX.test(v)
}

function isString(v: unknown): v is string {
    return typeof v === 'string' && v.length > 0
}

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// ─── Main Validator ────────────────────────────────────────────────────────────

export function validateThemeJSON(input: unknown): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!isObject(input)) {
        return { valid: false, errors: ['Theme must be a JSON object'], warnings }
    }

    const t = input as Record<string, unknown>

    // ── Required string fields ──
    if (!isString(t.id)) errors.push('Missing or invalid "id" (must be non-empty string)')
    else if (!KEBAB_REGEX.test(t.id as string)) errors.push('"id" must be kebab-case (e.g. "my-theme-v1")')

    if (!isString(t.name)) errors.push('Missing or invalid "name"')
    if (!isString(t.author)) errors.push('Missing or invalid "author"')

    if (!isString(t.version)) errors.push('Missing or invalid "version"')
    else if (!SEMVER_REGEX.test(t.version as string)) warnings.push('"version" should be semver (e.g. "1.0.0")')

    if (t.previewImage !== undefined && typeof t.previewImage !== 'string') {
        warnings.push('"previewImage" should be a URL string')
    }

    // ── Tokens ──
    if (!isObject(t.tokens)) {
        errors.push('Missing or invalid "tokens" object')
    } else {
        const tokens = t.tokens as Record<string, unknown>

        // Colors
        if (!isObject(tokens.colors)) {
            errors.push('Missing "tokens.colors"')
        } else {
            const colors = tokens.colors as Record<string, unknown>
            for (const key of ['primary', 'accent', 'bg', 'text', 'muted']) {
                if (!isHex(colors[key])) {
                    errors.push(`"tokens.colors.${key}" must be a valid hex color (got ${JSON.stringify(colors[key])})`)
                }
            }
        }

        // Fonts
        if (!isObject(tokens.fonts)) {
            errors.push('Missing "tokens.fonts"')
        } else {
            const fonts = tokens.fonts as Record<string, unknown>
            if (!isString(fonts.heading)) errors.push('Missing "tokens.fonts.heading"')
            if (!isString(fonts.body)) errors.push('Missing "tokens.fonts.body"')
        }

        // Radii
        if (!isObject(tokens.radii)) {
            errors.push('Missing "tokens.radii"')
        } else {
            const radii = tokens.radii as Record<string, unknown>
            for (const key of ['card', 'button']) {
                if (!isString(radii[key])) {
                    errors.push(`Missing "tokens.radii.${key}"`)
                } else if (!CSS_UNIT_REGEX.test(radii[key] as string) && radii[key] !== '9999px') {
                    warnings.push(`"tokens.radii.${key}" may not be a valid CSS unit (got "${radii[key]}")`)
                }
            }
        }

        // Spacings
        if (!isObject(tokens.spacings)) {
            errors.push('Missing "tokens.spacings"')
        } else {
            const spacings = tokens.spacings as Record<string, unknown>
            for (const key of ['container', 'gap']) {
                if (!isString(spacings[key])) {
                    errors.push(`Missing "tokens.spacings.${key}"`)
                }
            }
        }
    }

    // ── Components ──
    if (!isObject(t.components)) {
        errors.push('Missing or invalid "components" object')
    } else {
        const components = t.components as Record<string, unknown>

        // Hero
        if (isObject(components.hero)) {
            const hero = components.hero as Record<string, unknown>
            if (isString(hero.layout) && !HERO_LAYOUTS.includes(hero.layout as string)) {
                warnings.push(`"components.hero.layout" unknown value: "${hero.layout}". Allowed: ${HERO_LAYOUTS.join(', ')}`)
            }
            if (isString(hero.buttonStyle) && !BUTTON_STYLES.includes(hero.buttonStyle as string)) {
                warnings.push(`"components.hero.buttonStyle" unknown value: "${hero.buttonStyle}"`)
            }
        }

        // Product Grid
        if (isObject(components.productGrid)) {
            const grid = components.productGrid as Record<string, unknown>
            if (typeof grid.columns === 'number' && !GRID_COLUMNS.includes(grid.columns)) {
                warnings.push(`"components.productGrid.columns" should be 1-4 (got ${grid.columns})`)
            }
            if (isString(grid.cardStyle) && !CARD_STYLES.includes(grid.cardStyle as string)) {
                warnings.push(`"components.productGrid.cardStyle" unknown value: "${grid.cardStyle}"`)
            }
        }
    }

    // ── Assets ──
    if (t.assets !== undefined && !isObject(t.assets)) {
        errors.push('"assets" must be an object')
    }

    // ── SafeCSS ──
    if (t.safeCSS !== undefined && typeof t.safeCSS !== 'string') {
        errors.push('"safeCSS" must be a string')
    }
    if (typeof t.safeCSS === 'string' && t.safeCSS.length > 50000) {
        errors.push('"safeCSS" exceeds 50KB limit')
    }

    // ── Check for JS in safeCSS ──
    if (typeof t.safeCSS === 'string') {
        const css = t.safeCSS as string
        if (/expression\s*\(/i.test(css)) errors.push('"safeCSS" contains CSS expression() — blocked')
        if (/javascript\s*:/i.test(css)) errors.push('"safeCSS" contains javascript: — blocked')
        if (/<script/i.test(css)) errors.push('"safeCSS" contains <script> — blocked')
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

// ─── Convert validated input to typed ThemeJSON ────────────────────────────────

export function parseThemeJSON(input: unknown): ThemeJSON | null {
    const result = validateThemeJSON(input)
    if (!result.valid) return null
    return input as ThemeJSON
}
