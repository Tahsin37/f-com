"use client"

// ═══════════════════════════════════════════════════════════════════════════════
// F-Manager Theme Studio — Shopify-like Theme Flow
// Step 1: Copy your store code (HTML+CSS)
// Step 2: Copy the AI prompt → go to ChatGPT/Lovable → paste → get custom code
// Step 3: Paste the custom CSS/HTML back here → Save → Done!
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { toast } from "sonner"
import { sanitizeCSS } from "@/lib/theme/css-sanitizer"
import { getStoreUrl } from "@/lib/utils"
import {
    generateLiveStoreHTML, generateLiveStoreCSS, STORE_STRUCTURE_REFERENCE,
    type StoreCodeInput,
} from "@/lib/theme/store-code-extractor"
import {
    Loader2, Save, Eye, Check, Copy, Heart, ChevronRight, FileCode,
    Shield, Palette, ExternalLink, MessageSquare, ArrowDown, Sparkles,
} from "lucide-react"

// ─── Demo Prompt for ChatGPT/Lovable ──────────────────────────────────────────
function buildDemoPrompt(storeHTML: string, storeCSS: string, storeName: string, customPrompt: string): string {
    return `I have an e-commerce store called "${storeName}" built on F-Manager platform. Below is my store's complete HTML structure and CSS.

I need you to redesign my store to make it look more premium and beautiful. Here are my requirements:

1. **Keep ALL existing HTML IDs and classes exactly the same** — they are connected to the cart, search, checkout, and other functional features. Do NOT rename or remove any class or ID.
2. **Only output CSS** and any additional HTML sections I asked for. Do not rewrite my existing HTML, just style it.
3. **Use the CSS variables** like --theme-color-primary, --theme-color-accent etc. so I can easily change colors later.

--- MY CUSTOM REQUEST ---
${customPrompt || "Make it look like a premium Shopify store — clean, modern, fast-feeling, with subtle animations and beautiful card designs."}
-------------------------

Here is my current store HTML:
\`\`\`html
${storeHTML}
\`\`\`

Here is my current store CSS:
\`\`\`css
${storeCSS}
\`\`\`

Please give me:
1. A complete redesigned CSS (keeping all class names and IDs the same)
2. The HTML for any extra sections I requested`
}

export default function ThemeManagerPage() {
    const [loading, setLoading] = useState(true)
    const [sellerId, setSellerId] = useState("")
    const [sellerSlug, setSellerSlug] = useState("")
    const [sellerName, setSellerName] = useState("")
    const [sellerSettings, setSellerSettings] = useState<Record<string, any>>({})

    const [storeHTML, setStoreHTML] = useState("")
    const [storeCSS, setStoreCSS] = useState("")
    const [userPrompt, setUserPrompt] = useState("")
    const [demoPrompt, setDemoPrompt] = useState("")
    const [codeView, setCodeView] = useState<"prompt" | "html" | "css" | "reference">("prompt")
    const [copied, setCopied] = useState<string | null>(null)

    // Custom code paste-back
    const [customCSS, setCustomCSS] = useState("")
    const [customHTML, setCustomHTML] = useState("")
    const [savingCode, setSavingCode] = useState(false)

    // Load seller data (graceful — works even without themes table)
    useEffect(() => {
        async function load() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.user?.id) { setLoading(false); return }

                // Only query sellers — NOT themes (to avoid crash if migration not run)
                const { data: s, error } = await supabase.from("sellers")
                    .select("id, slug, name, settings")
                    .eq("user_id", session.user.id).single()

                if (error || !s) { setLoading(false); return }
                setSellerId(s.id); setSellerSlug(s.slug); setSellerName(s.name)
                setSellerSettings(s.settings || {})

                // Generate store code
                const input: StoreCodeInput = {
                    storeName: s.name,
                    slug: s.slug,
                    primaryColor: s.settings?.theme_color || '#0EA5A4',
                    tagline: s.settings?.store_tagline || 'Quality products with fast delivery! 🇧🇩',
                    bannerTitle: s.settings?.banner_title || `${s.name} — New Arrivals`,
                    bannerSubtitle: s.settings?.banner_subtitle || 'Free delivery on orders above ৳999',
                    bannerCta: s.settings?.banner_cta || 'Shop Now',
                    categories: [],
                    announcement: s.settings?.announcement_bar,
                    whatsappNumber: s.settings?.whatsapp_number,
                }

                // Get categories
                const { data: products } = await supabase.from("products")
                    .select("category").eq("seller_id", s.id).eq("is_active", true)
                if (products) {
                    input.categories = ['🔥 All', ...new Set(products.map((p: any) => p.category).filter(Boolean))]
                }

                const html = generateLiveStoreHTML(input)
                const css = generateLiveStoreCSS(input)
                setStoreHTML(html)
                setStoreCSS(css)
                setDemoPrompt(buildDemoPrompt(html, css, s.name, userPrompt))

                // Load saved custom CSS/HTML
                if (s.settings?.custom_css) setCustomCSS(s.settings.custom_css)
                if (s.settings?.custom_html) setCustomHTML(s.settings.custom_html)
            } catch (err) {
                console.error("Theme Studio load error:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Update prompt when userPrompt changes
    useEffect(() => {
        if (storeHTML && storeCSS && sellerName) {
            setDemoPrompt(buildDemoPrompt(storeHTML, storeCSS, sellerName, userPrompt))
        }
    }, [userPrompt, storeHTML, storeCSS, sellerName])

    // ─── Copy helper ──────────────────────────────────────────────────────────
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        toast.success(`${label} copied!`)
        setTimeout(() => setCopied(null), 2500)
    }

    // ─── Save custom CSS/HTML ─────────────────────────────────────────────────
    const handleSaveCustomCode = async () => {
        setSavingCode(true)
        try {
            let safeCss = customCSS
            if (customCSS.trim()) {
                const result = sanitizeCSS(customCSS)
                safeCss = result.css
                if (result.warnings.length > 0) {
                    toast.warning(`CSS sanitized: ${result.warnings[0]}`)
                }
            }

            // Strip scripts from custom HTML
            let safeHTML = customHTML
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/\s+on\w+\s*=\s*(['"])[^'"]*\1/gi, '')

            const { error } = await supabase.from("sellers").update({
                settings: {
                    ...sellerSettings,
                    custom_css: safeCss,
                    custom_html: safeHTML,
                }
            }).eq("id", sellerId)

            if (error) throw error
            setSellerSettings(prev => ({ ...prev, custom_css: safeCss, custom_html: safeHTML }))
            toast.success("✅ Custom theme saved! Visit your store to see changes.")
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSavingCode(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center py-24">
            <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
                <p className="text-xs text-muted-foreground animate-pulse">Loading Theme Studio...</p>
            </div>
        </div>
    )

    const codeContent = codeView === "html" ? storeHTML
        : codeView === "css" ? storeCSS
            : codeView === "reference" ? STORE_STRUCTURE_REFERENCE
                : demoPrompt

    const codeLabel = codeView === "html" ? "HTML"
        : codeView === "css" ? "CSS"
            : codeView === "reference" ? "Reference"
                : "AI Prompt"

    return (
        <div className="space-y-4 max-w-4xl mx-auto pb-24">

            {/* ══════════════ HEADER ══════════════ */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-extrabold tracking-tight">Theme Studio</h1>
                        <p className="text-muted-foreground text-[10px]">Customize your store like Shopify</p>
                    </div>
                </div>
                {sellerSlug && (
                    <a href={getStoreUrl(sellerSlug)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="rounded-2xl gap-1.5 text-[10px] h-8 active:scale-95 transition-transform">
                            <ExternalLink className="h-3 w-3" /> Live Store
                        </Button>
                    </a>
                )}
            </div>

            {/* ══════════════ HOW IT WORKS ══════════════ */}
            <Card className="overflow-hidden border-0 shadow-xl">
                <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 p-4 text-white">
                    <h2 className="text-sm font-extrabold mb-2">🎨 How it works — 3 simple steps</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { step: "1", title: "Copy AI Prompt", desc: "Contains your full store code" },
                            { step: "2", title: "Paste in ChatGPT", desc: "Or Lovable, Claude, etc." },
                            { step: "3", title: "Paste CSS here", desc: "Save & your store is updated" },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1 text-xs font-extrabold">{s.step}</div>
                                <p className="text-[10px] font-bold">{s.title}</p>
                                <p className="text-[8px] text-white/70">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* ══════════════ STEP 1: COPY PROMPT ══════════════ */}
            <Card className="overflow-hidden border-0 shadow-lg">
                <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 border-b p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-teal-600 flex items-center justify-center text-white text-[10px] font-extrabold">1</div>
                        <span className="text-xs font-bold">Copy Your Store Code & AI Prompt</span>
                    </div>
                    <div className="flex gap-1">
                        {(["prompt", "html", "css", "reference"] as const).map(v => (
                            <button key={v} onClick={() => setCodeView(v)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all active:scale-95 ${codeView === v ? "bg-teal-600 text-white shadow-sm" : "bg-neutral-200 dark:bg-neutral-800 text-muted-foreground hover:bg-neutral-300"}`}>
                                {v === "prompt" ? "🤖 AI Prompt" : v === "html" ? "📄 HTML" : v === "css" ? "🎨 CSS" : "📌 IDs & Classes"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <Button
                        onClick={() => handleCopy(codeContent, codeLabel)}
                        size="sm"
                        className="absolute top-3 right-3 z-10 rounded-xl gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] h-7 shadow-lg active:scale-95 transition-transform"
                    >
                        {copied === codeLabel ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied === codeLabel ? "Copied!" : `Copy ${codeLabel}`}
                    </Button>
                    <pre className="w-full min-h-[300px] max-h-[450px] overflow-auto p-4 pr-28 font-mono text-[10px] leading-relaxed bg-[#1e1e2e] text-[#cdd6f4] select-all whitespace-pre-wrap">
                        {codeContent}
                    </pre>
                </div>

                {codeView === "prompt" && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 p-4 space-y-3">
                        <div>
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1.5 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" /> What do you want your store to look like?
                            </p>
                            <Textarea
                                value={userPrompt}
                                onChange={e => setUserPrompt(e.target.value)}
                                placeholder="E.g., I want a dark luxury theme with gold accents, large product cards, and a sleek pebble-style feeling."
                                className="min-h-[80px] bg-white dark:bg-black/20 border-amber-200/50 dark:border-amber-900/50 text-[11px] rounded-xl shadow-inner focus:ring-amber-500/20"
                            />
                        </div>
                        <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                            <strong>👉 Next:</strong> Tell AI what you want above, click <strong className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">Copy AI Prompt</strong> → Open{" "}
                            <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">ChatGPT</a>,{" "}
                            <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="underline font-bold">Lovable</a>, or{" "}
                            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="underline font-bold">Claude</a>{" "}
                            → Paste → Get your custom CSS back → Come back here and paste it in Step 3.
                        </p>
                    </div>
                )}
            </Card>

            {/* ══════════════ STEP 2: GO TO AI ══════════════ */}
            <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                    <ArrowDown className="h-4 w-4 text-teal-600 animate-bounce" />
                    <span>After AI gives you the custom CSS, paste it below</span>
                    <ArrowDown className="h-4 w-4 text-teal-600 animate-bounce" />
                </div>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* ══════════════ STEP 3: PASTE BACK ══════════════ */}
            <Card className="overflow-hidden border-0 shadow-lg">
                <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950 border-b p-3">
                    <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center text-white text-[10px] font-extrabold">3</div>
                    <span className="text-xs font-bold">Paste Your Custom CSS</span>
                    <span className="text-[8px] text-muted-foreground ml-1">from ChatGPT / Lovable / Claude</span>
                </div>
                <CardContent className="p-4 space-y-3">
                    <Textarea
                        value={customCSS}
                        onChange={e => setCustomCSS(e.target.value)}
                        placeholder={`/* Paste the CSS you got from ChatGPT/Lovable here */

/* Example — it should look something like this: */

:root {
    --theme-color-primary: #0EA5A4;
    --theme-color-accent: #FFD166;
}

.product-card {
    border-radius: 1.5rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    transition: transform 0.3s;
}

.product-card:hover {
    transform: translateY(-6px);
}

/* ... more styles from AI ... */`}
                        className="min-h-[200px] rounded-xl font-mono text-[10px] bg-neutral-50 dark:bg-neutral-950 focus:ring-2 focus:ring-violet-500/20"
                    />

                    {/* Optional custom HTML */}
                    <details className="group">
                        <summary className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                            <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                            Extra HTML Sections (optional)
                        </summary>
                        <Textarea
                            value={customHTML}
                            onChange={e => setCustomHTML(e.target.value)}
                            placeholder={`<!-- Paste any extra HTML sections the AI gave you -->
<!-- Example: a promo banner -->
<section style="padding: 2rem; text-align: center; background: var(--theme-color-primary); color: #fff; margin: 1rem; border-radius: 1rem;">
    <h2>🎉 Special Offer!</h2>
    <p>Use code SAVE20 for 20% off</p>
</section>`}
                            className="mt-2 min-h-[120px] rounded-xl font-mono text-[10px] bg-neutral-50 dark:bg-neutral-950"
                        />
                    </details>

                    <Button
                        onClick={handleSaveCustomCode}
                        disabled={savingCode || (!customCSS.trim() && !customHTML.trim())}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white font-bold text-sm gap-2 shadow-xl shadow-violet-500/10 active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                        {savingCode ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {savingCode ? "Applying to your store..." : "💾 Save & Apply to Store"}
                    </Button>

                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <Shield className="h-3 w-3 text-green-500" />
                        CSS is sanitized automatically. JavaScript is blocked for security.
                    </div>

                    {/* Status: what's currently applied */}
                    {sellerSettings.custom_css && (
                        <div className="mt-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Custom theme is active</span>
                            </div>
                            <p className="text-[9px] text-green-600 dark:text-green-500">
                                {sellerSettings.custom_css.length} characters of custom CSS applied.
                                {sellerSettings.custom_html ? ` + custom HTML sections.` : ''}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ══════════════ QUICK LINKS ══════════════ */}
            <div className="grid grid-cols-3 gap-2">
                <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-teal-300 transition-all active:scale-95">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <div>
                        <p className="text-[10px] font-bold">ChatGPT</p>
                        <p className="text-[8px] text-muted-foreground">Best for CSS</p>
                    </div>
                </a>
                <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-teal-300 transition-all active:scale-95">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <div>
                        <p className="text-[10px] font-bold">Lovable</p>
                        <p className="text-[8px] text-muted-foreground">Full HTML+CSS</p>
                    </div>
                </a>
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-teal-300 transition-all active:scale-95">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <div>
                        <p className="text-[10px] font-bold">Claude</p>
                        <p className="text-[8px] text-muted-foreground">Detailed CSS</p>
                    </div>
                </a>
            </div>

            {/* ══════════════ THEME EDITOR LINK ══════════════ */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 p-4 flex items-center justify-between gap-3 shadow-lg shadow-violet-500/10">
                <div className="flex items-center gap-3 text-white">
                    <Palette className="h-5 w-5" />
                    <div>
                        <p className="text-xs font-bold">Quick Theme Editor</p>
                        <p className="text-[9px] text-white/70">Change colors, fonts, sections without code</p>
                    </div>
                </div>
                <a href="/dashboard/theme">
                    <Button className="rounded-xl bg-white text-violet-700 hover:bg-white/90 font-bold text-[10px] h-8 gap-1 active:scale-95 transition-transform">
                        Open <ChevronRight className="h-3 w-3" />
                    </Button>
                </a>
            </div>
        </div>
    )
}
