// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager AI Theme Resolver (Mock)
// Generates ThemeJSON from natural language prompts
// Replace with real OpenAI / Anthropic call for production
// ═══════════════════════════════════════════════════════════════════════════════

import type { ThemeJSON, HeroLayout, CardStyleVariant } from './types'
import { validateThemeJSON } from './schema'

// ─── Keyword → Design Token Mapping ───────────────────────────────────────────

const COLOR_PALETTES: Record<string, { primary: string; accent: string; bg: string; text: string; muted: string }> = {
    pastel: { primary: '#A78BFA', accent: '#F9A8D4', bg: '#FEFCFF', text: '#1E1B4B', muted: '#C4B5FD' },
    dark: { primary: '#10B981', accent: '#F59E0B', bg: '#0F172A', text: '#F8FAFC', muted: '#64748B' },
    ocean: { primary: '#0EA5E9', accent: '#06B6D4', bg: '#F0F9FF', text: '#0C4A6E', muted: '#7DD3FC' },
    forest: { primary: '#059669', accent: '#84CC16', bg: '#F0FDF4', text: '#14532D', muted: '#6EE7B7' },
    sunset: { primary: '#F97316', accent: '#EC4899', bg: '#FFF7ED', text: '#431407', muted: '#FDBA74' },
    corporate: { primary: '#3B82F6', accent: '#8B5CF6', bg: '#FFFFFF', text: '#1E293B', muted: '#94A3B8' },
    lovable: { primary: '#0EA5A4', accent: '#FFD166', bg: '#FFFFFF', text: '#0F172A', muted: '#94A3B8' },
    warm: { primary: '#DC2626', accent: '#F59E0B', bg: '#FFFBEB', text: '#451A03', muted: '#FCA5A5' },
    minimal: { primary: '#18181B', accent: '#A1A1AA', bg: '#FAFAFA', text: '#09090B', muted: '#D4D4D8' },
    candy: { primary: '#EC4899', accent: '#A855F7', bg: '#FDF2F8', text: '#831843', muted: '#F9A8D4' },
    nature: { primary: '#16A34A', accent: '#CA8A04', bg: '#F7FEE7', text: '#14532D', muted: '#86EFAC' },
    premium: { primary: '#B45309', accent: '#D97706', bg: '#0F0F0F', text: '#FAFAF9', muted: '#78716C' },
}

const FONT_STYLES: Record<string, { heading: string; body: string }> = {
    modern: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
    elegant: { heading: "'Playfair Display', serif", body: "'Lora', serif" },
    playful: { heading: "'Outfit', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif" },
    bold: { heading: "'Space Grotesk', system-ui, sans-serif", body: "'Noto Sans Bengali', system-ui, sans-serif" },
    clean: { heading: "'Poppins', system-ui, sans-serif", body: "'Poppins', system-ui, sans-serif" },
    professional: { heading: "'Roboto', system-ui, sans-serif", body: "'Roboto', system-ui, sans-serif" },
    bengali: { heading: "'Space Grotesk', system-ui, sans-serif", body: "'Noto Sans Bengali', system-ui, sans-serif" },
}

const LAYOUT_KEYWORDS: Record<string, HeroLayout> = {
    carousel: 'carousel',
    slider: 'carousel',
    split: 'split',
    'two-column': 'split',
    'full-width': 'full-width-bg',
    fullscreen: 'full-width-bg',
    centered: 'centered-image-right',
    minimal: 'minimal',
    simple: 'minimal',
}

const CARD_KEYWORDS: Record<string, CardStyleVariant> = {
    rounded: 'rounded-shadow',
    shadow: 'rounded-shadow',
    flat: 'flat',
    minimal: 'minimal',
    bordered: 'bordered',
    elevated: 'elevated',
    card: 'rounded-shadow',
}

// ─── Prompt Analyzer ───────────────────────────────────────────────────────────

function analyzePrompt(prompt: string) {
    const lower = prompt.toLowerCase()

    // Find best color palette
    let palette = COLOR_PALETTES.lovable
    for (const [key, val] of Object.entries(COLOR_PALETTES)) {
        if (lower.includes(key)) { palette = val; break }
    }

    // Check for specific color mentions
    if (lower.includes('pink') || lower.includes('rose')) palette = COLOR_PALETTES.candy
    if (lower.includes('blue') || lower.includes('ocean')) palette = COLOR_PALETTES.ocean
    if (lower.includes('green') || lower.includes('nature')) palette = COLOR_PALETTES.forest
    if (lower.includes('dark') || lower.includes('night')) palette = COLOR_PALETTES.dark
    if (lower.includes('orange') || lower.includes('warm')) palette = COLOR_PALETTES.warm
    if (lower.includes('gold') || lower.includes('premium') || lower.includes('luxury')) palette = COLOR_PALETTES.premium

    // Find font style
    let fonts = FONT_STYLES.bengali
    for (const [key, val] of Object.entries(FONT_STYLES)) {
        if (lower.includes(key)) { fonts = val; break }
    }

    // Hero layout
    let heroLayout: HeroLayout = 'centered-image-right'
    for (const [key, val] of Object.entries(LAYOUT_KEYWORDS)) {
        if (lower.includes(key)) { heroLayout = val; break }
    }

    // Card style
    let cardStyle: CardStyleVariant = 'rounded-shadow'
    for (const [key, val] of Object.entries(CARD_KEYWORDS)) {
        if (lower.includes(key)) { cardStyle = val; break }
    }

    // Grid columns
    let columns: 1 | 2 | 3 | 4 = 2
    if (lower.includes('3 column') || lower.includes('three')) columns = 3
    if (lower.includes('4 column') || lower.includes('four')) columns = 4
    if (lower.includes('1 column') || lower.includes('single') || lower.includes('list')) columns = 1

    // Border radius
    let radii = { card: '1rem', button: '9999px' }
    if (lower.includes('sharp') || lower.includes('square')) radii = { card: '0', button: '0.25rem' }
    if (lower.includes('rounded') || lower.includes('pill')) radii = { card: '1.5rem', button: '9999px' }

    return { palette, fonts, heroLayout, cardStyle, columns, radii }
}

// ─── Generator ─────────────────────────────────────────────────────────────────

export function generateThemeFromPrompt(prompt: string): {
    success: boolean
    theme: ThemeJSON | null
    message: string
} {
    const analysis = analyzePrompt(prompt)

    const themeId = `ai-${Date.now()}`
    const theme: ThemeJSON = {
        id: themeId,
        name: `AI Theme — ${prompt.substring(0, 40)}`,
        author: 'AI Designer',
        version: '1.0.0',
        previewImage: `https://placehold.co/600x300/${analysis.palette.primary.replace('#', '')}/${analysis.palette.bg.replace('#', '')}?text=AI+Theme`,
        tokens: {
            colors: analysis.palette,
            fonts: analysis.fonts,
            radii: analysis.radii,
            spacings: { container: '1200px', gap: '1.25rem' },
        },
        components: {
            hero: { layout: analysis.heroLayout, buttonStyle: 'primary-filled' },
            productGrid: { columns: analysis.columns, cardStyle: analysis.cardStyle },
        },
        assets: {
            logo: `https://placehold.co/200x60/${analysis.palette.primary.replace('#', '')}/ffffff?text=Store`,
            heroImage: `https://placehold.co/800x600/${analysis.palette.accent.replace('#', '')}/ffffff?text=Hero`,
        },
        safeCSS: `.btn-primary { box-shadow: 0 8px 24px ${analysis.palette.primary}20; }`,
    }

    const validation = validateThemeJSON(theme)

    return {
        success: validation.valid,
        theme: validation.valid ? theme : null,
        message: validation.valid
            ? `Generated theme from prompt: "${prompt.substring(0, 60)}"`
            : `Validation failed: ${validation.errors.join(', ')}`,
    }
}
