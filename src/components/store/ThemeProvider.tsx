"use client"

// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager ThemeProvider
// Applies ThemeJSON tokens as CSS variables + loads fonts + injects safeCSS
// ═══════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useMemo } from "react"
import type { ThemeJSON, ThemeTokens } from "@/lib/theme/types"

interface ThemeContextValue {
    theme: ThemeJSON | null
    tokens: ThemeTokens | null
}

const ThemeContext = createContext<ThemeContextValue>({ theme: null, tokens: null })

export function useTheme() {
    return useContext(ThemeContext)
}

// ─── Extract Google Font family names from CSS stack ───────────────────────────

function extractFontFamilies(fontStack: string): string[] {
    return fontStack
        .split(",")
        .map(f => f.trim().replace(/['"]/g, ""))
        .filter(f => !["system-ui", "sans-serif", "serif", "monospace", "cursive"].includes(f))
}

// ─── Build Google Fonts URL ────────────────────────────────────────────────────

function buildGoogleFontsUrl(families: string[]): string {
    if (families.length === 0) return ""
    const params = families
        .map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`)
        .join("&")
    return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

// ─── CSS Variables from Tokens ─────────────────────────────────────────────────

function tokensToCSSVariables(tokens: ThemeTokens): string {
    return `
:root {
    --theme-color-primary: ${tokens.colors.primary};
    --theme-color-accent: ${tokens.colors.accent};
    --theme-color-bg: ${tokens.colors.bg};
    --theme-color-text: ${tokens.colors.text};
    --theme-color-muted: ${tokens.colors.muted};
    --theme-font-heading: ${tokens.fonts.heading};
    --theme-font-body: ${tokens.fonts.body};
    --theme-radius-card: ${tokens.radii.card};
    --theme-radius-button: ${tokens.radii.button};
    --theme-spacing-container: ${tokens.spacings.container};
    --theme-spacing-gap: ${tokens.spacings.gap};
}
`.trim()
}

// ─── Provider Component ────────────────────────────────────────────────────────

interface ThemeProviderProps {
    theme: ThemeJSON | null
    children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    const tokens = theme?.tokens ?? null

    // Load Google Fonts
    useEffect(() => {
        if (!tokens) return

        const families = [
            ...extractFontFamilies(tokens.fonts.heading),
            ...extractFontFamilies(tokens.fonts.body),
        ]
        const unique = [...new Set(families)]
        const url = buildGoogleFontsUrl(unique)
        if (!url) return

        // Check if already loaded
        const existing = document.querySelector(`link[href="${url}"]`)
        if (existing) return

        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = url
        link.crossOrigin = "anonymous"
        document.head.appendChild(link)

        return () => {
            // Don't remove — fonts may be shared across components
        }
    }, [tokens])

    // Inject CSS variables + safeCSS
    useEffect(() => {
        if (!tokens) return

        const cssVars = tokensToCSSVariables(tokens)
        const safeCSS = theme?.safeCSS ?? ""
        const fullCSS = `${cssVars}\n${safeCSS}`

        const styleId = "fmanager-theme-vars"
        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
        if (!styleEl) {
            styleEl = document.createElement("style")
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }
        styleEl.textContent = fullCSS

        return () => {
            // Clean up on unmount
            const el = document.getElementById(styleId)
            if (el) el.remove()
        }
    }, [tokens, theme?.safeCSS])

    const value = useMemo(() => ({ theme, tokens }), [theme, tokens])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
