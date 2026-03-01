"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { THEME_PRESETS, type ThemePreset, type ThemeConfig, DEFAULT_STORE_SECTIONS, type StoreSection } from "@/lib/types"
import {
    Loader2, Save, Palette, Type, Layout, Eye, GripVertical,
    ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Sparkles, Plus, Settings
} from "lucide-react"

export default function ThemeEditorPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [sellerId, setSellerId] = useState("")
    const [sellerSlug, setSellerSlug] = useState("")
    const [currentSettings, setCurrentSettings] = useState<Record<string, any>>({})

    // Theme state
    const [preset, setPreset] = useState<ThemePreset>("custom")
    const [primaryColor, setPrimaryColor] = useState("#0d9488")
    const [secondaryColor, setSecondaryColor] = useState("#f0fdfa")
    const [accentColor, setAccentColor] = useState("#f59e0b")
    const [bgColor, setBgColor] = useState("#ffffff")
    const [textColor, setTextColor] = useState("#111827")
    const [fontHeading, setFontHeading] = useState("Inter")
    const [fontBody, setFontBody] = useState("Inter")
    const [borderRadius, setBorderRadius] = useState<string>("md")

    // Sections
    const [sections, setSections] = useState<StoreSection[]>(DEFAULT_STORE_SECTIONS)

    // Announcement bar
    const [announcementEnabled, setAnnouncementEnabled] = useState(false)
    const [announcementText, setAnnouncementText] = useState("")
    const [announcementBg, setAnnouncementBg] = useState("#0d9488")
    const [announcementColor, setAnnouncementColor] = useState("#ffffff")

    // Advanced Toggles
    const [hideOutOfStock, setHideOutOfStock] = useState(false)
    const [whatsappNumber, setWhatsappNumber] = useState("")
    const [storeTagline, setStoreTagline] = useState("")

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user?.id) { setLoading(false); return }
            const { data: seller } = await supabase.from("sellers").select("id, slug, settings").eq("user_id", session.user.id).single()
            if (!seller) { setLoading(false); return }
            setSellerId(seller.id)
            setSellerSlug(seller.slug)
            const s = seller.settings || {}
            setCurrentSettings(s)

            // Load theme
            if (s.theme) {
                setPreset(s.theme.preset || "custom")
                setPrimaryColor(s.theme.colors?.primary || "#0d9488")
                setSecondaryColor(s.theme.colors?.secondary || "#f0fdfa")
                setAccentColor(s.theme.colors?.accent || "#f59e0b")
                setBgColor(s.theme.colors?.background || "#ffffff")
                setTextColor(s.theme.colors?.text || "#111827")
                setFontHeading(s.theme.font_heading || "Inter")
                setFontBody(s.theme.font_body || "Inter")
                setBorderRadius(s.theme.border_radius || "md")
            }
            if (s.theme_color) setPrimaryColor(s.theme_color)

            // Load sections
            if (s.sections?.length) setSections(s.sections)

            // Load announcement
            if (s.announcement_bar) {
                setAnnouncementEnabled(s.announcement_bar.enabled)
                setAnnouncementText(s.announcement_bar.text || "")
                setAnnouncementBg(s.announcement_bar.bg_color || "#0d9488")
                setAnnouncementColor(s.announcement_bar.text_color || "#ffffff")
            }

            // Load advanced toggles
            setHideOutOfStock(s.hide_out_of_stock || false)
            setWhatsappNumber(s.whatsapp_number || "")
            setStoreTagline(s.store_tagline || "")

            setLoading(false)
        }
        load()
    }, [])

    const applyPreset = (p: ThemePreset) => {
        const t = THEME_PRESETS[p]
        setPreset(p)
        setPrimaryColor(t.colors.primary)
        setSecondaryColor(t.colors.secondary)
        setAccentColor(t.colors.accent)
        setBgColor(t.colors.background)
        setTextColor(t.colors.text)
        setFontHeading(t.font_heading)
        setFontBody(t.font_body)
        setBorderRadius(t.border_radius)
    }

    const moveSection = (idx: number, dir: -1 | 1) => {
        const target = idx + dir
        if (target < 0 || target >= sections.length) return
        const updated = [...sections]
        const temp = updated[idx]
        updated[idx] = updated[target]
        updated[target] = temp
        updated.forEach((s, i) => s.order = i)
        setSections(updated)
    }

    const toggleSection = (idx: number) => {
        const updated = [...sections]
        updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled }
        setSections(updated)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const theme: ThemeConfig = {
                preset,
                colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor, background: bgColor, text: textColor },
                font_heading: fontHeading, font_body: fontBody, border_radius: borderRadius as any,
            }

            const updatedSettings = {
                ...currentSettings,
                theme_color: primaryColor,
                theme,
                sections,
                announcement_bar: {
                    enabled: announcementEnabled,
                    text: announcementText,
                    bg_color: announcementBg,
                    text_color: announcementColor,
                },
                hide_out_of_stock: hideOutOfStock,
                whatsapp_number: whatsappNumber,
                store_tagline: storeTagline,
            }

            const { error } = await supabase.from("sellers").update({ settings: updatedSettings }).eq("id", sellerId)
            if (error) throw error
            setCurrentSettings(updatedSettings)
            toast.success("Theme saved!")
        } catch (err: any) { toast.error(err.message || "Failed to save") }
        finally { setSaving(false) }
    }

    const fonts = ["Inter", "Outfit", "Poppins", "Playfair Display", "Roboto", "Lora", "Montserrat", "DM Sans"]

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Theme Editor</h1>
                    <p className="text-muted-foreground text-sm mt-1">Customize your store's look and feel</p>
                </div>
                <div className="flex gap-2">
                    {sellerSlug && (
                        <Button variant="outline" className="rounded-xl gap-1 text-xs" asChild>
                            <a href={`/store/${sellerSlug}`} target="_blank"><Eye className="h-3.5 w-3.5" /> Preview</a>
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2 font-bold">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save Theme"}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Theme Presets */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> Theme Presets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(Object.keys(THEME_PRESETS) as ThemePreset[]).map(p => {
                                const t = THEME_PRESETS[p]
                                return (
                                    <button key={p} onClick={() => applyPreset(p)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${preset === p ? "border-teal-500 shadow-md" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
                                        <div className="flex gap-1 mb-2">
                                            {Object.values(t.colors).slice(0, 4).map((c, i) => (
                                                <div key={i} className="h-4 w-4 rounded-full border border-neutral-200" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                        <p className="text-xs font-bold capitalize">{p}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.font_heading}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Colors */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-violet-500" /> Colors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Primary", value: primaryColor, set: setPrimaryColor },
                                { label: "Secondary", value: secondaryColor, set: setSecondaryColor },
                                { label: "Accent", value: accentColor, set: setAccentColor },
                                { label: "Background", value: bgColor, set: setBgColor },
                                { label: "Text", value: textColor, set: setTextColor },
                            ].map(c => (
                                <div key={c.label} className="flex items-center gap-2">
                                    <input type="color" value={c.value} onChange={e => { c.set(e.target.value); setPreset("custom") }}
                                        className="h-8 w-8 rounded-lg border cursor-pointer" />
                                    <div>
                                        <p className="text-xs font-bold">{c.label}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">{c.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fonts */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Type className="h-4 w-4 text-blue-500" /> Typography</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Heading Font</Label>
                            <select value={fontHeading} onChange={e => setFontHeading(e.target.value)}
                                className="w-full h-10 rounded-xl border px-3 text-sm bg-background">
                                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Body Font</Label>
                            <select value={fontBody} onChange={e => setFontBody(e.target.value)}
                                className="w-full h-10 rounded-xl border px-3 text-sm bg-background">
                                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Border Radius</Label>
                            <div className="flex gap-2">
                                {["none", "sm", "md", "lg", "full"].map(r => (
                                    <button key={r} onClick={() => setBorderRadius(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${borderRadius === r ? "bg-teal-600 text-white border-teal-600" : "border-neutral-200 dark:border-neutral-700"}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Announcement Bar */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 justify-between">
                            <span className="flex items-center gap-2"><Layout className="h-4 w-4 text-orange-500" /> Announcement Bar</span>
                            <button onClick={() => setAnnouncementEnabled(!announcementEnabled)}>
                                {announcementEnabled ? <ToggleRight className="h-5 w-5 text-teal-600" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
                            </button>
                        </CardTitle>
                    </CardHeader>
                    {announcementEnabled && (
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold">Text</Label>
                                <Input value={announcementText} onChange={e => setAnnouncementText(e.target.value)} placeholder="🔥 Free shipping on orders above ৳999!" className="h-10 rounded-xl" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={announcementBg} onChange={e => setAnnouncementBg(e.target.value)} className="h-8 w-8 rounded-lg border cursor-pointer" />
                                    <span className="text-xs">BG</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={announcementColor} onChange={e => setAnnouncementColor(e.target.value)} className="h-8 w-8 rounded-lg border cursor-pointer" />
                                    <span className="text-xs">Text</span>
                                </div>
                            </div>
                            {/* Preview */}
                            <div className="text-center py-2 px-3 rounded-lg text-xs" style={{ backgroundColor: announcementBg, color: announcementColor }}>
                                {announcementText || "Your announcement text here"}
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Advanced Settings */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4 text-slate-500" /> Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold">Store Tagline</Label>
                        <Input value={storeTagline} onChange={e => setStoreTagline(e.target.value)} placeholder="E.g. The best fashion store in Dhaka" className="h-10 rounded-xl" />
                        <p className="text-[10px] text-muted-foreground">Appears below the store name in the header.</p>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-bold flex items-center gap-1">WhatsApp Hover Button Number</Label>
                        <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="01XXXXXXXXX" className="h-10 rounded-xl" />
                        <p className="text-[10px] text-muted-foreground">Adds a floating WhatsApp button to your store. Leave empty to disable.</p>
                    </div>

                    <div className="flex items-center justify-between border p-3 rounded-xl border-neutral-200 dark:border-neutral-800">
                        <div>
                            <p className="text-xs font-bold">Hide Out of Stock Products</p>
                            <p className="text-[10px] text-muted-foreground">Automatically hide products when inventory reaches 0</p>
                        </div>
                        <button onClick={() => setHideOutOfStock(!hideOutOfStock)}>
                            {hideOutOfStock ? <ToggleRight className="h-5 w-5 text-teal-600" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Section Reorder + Content Editing */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Layout className="h-4 w-4 text-green-500" /> Homepage Sections (Drag to Reorder)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {sections.sort((a, b) => a.order - b.order).map((section, idx) => (
                            <div
                                key={section.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", String(idx))
                                    e.currentTarget.style.opacity = "0.4"
                                }}
                                onDragEnd={(e) => { e.currentTarget.style.opacity = "1" }}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    e.currentTarget.classList.add("border-blue-400", "border-2")
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.classList.remove("border-blue-400", "border-2")
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    e.currentTarget.classList.remove("border-blue-400", "border-2")
                                    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"))
                                    if (isNaN(fromIdx) || fromIdx === idx) return
                                    const updated = [...sections]
                                    const [moved] = updated.splice(fromIdx, 1)
                                    updated.splice(idx, 0, moved)
                                    updated.forEach((s, i) => s.order = i)
                                    setSections(updated)
                                }}
                                className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-hidden transition-all cursor-grab active:cursor-grabbing"
                            >
                                {/* Section header row */}
                                <div className="flex items-center gap-3 p-3">
                                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...sections]
                                            updated[idx] = { ...updated[idx], _expanded: !updated[idx]._expanded } as any
                                            setSections(updated)
                                        }}
                                        className="flex-1 text-left"
                                    >
                                        <p className="text-sm font-semibold capitalize">{section.type.replace(/_/g, " ")}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {section.enabled ? "✅ Active" : "⚫ Hidden"} — Click to {(section as any)._expanded ? "collapse" : "edit content"}
                                        </p>
                                    </button>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="h-7 w-7 rounded-lg border flex items-center justify-center disabled:opacity-30">
                                            <ChevronUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="h-7 w-7 rounded-lg border flex items-center justify-center disabled:opacity-30">
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => toggleSection(idx)} className="ml-1">
                                            {section.enabled ? <ToggleRight className="h-5 w-5 text-teal-600" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded content editor */}
                                {(section as any)._expanded && (
                                    <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-3 bg-white dark:bg-neutral-900">
                                        {/* Hero Slider */}
                                        {section.type === "hero_slider" && (
                                            <>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Hero Title</Label>
                                                    <Input value={(section as any).title || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).title = e.target.value; setSections(u)
                                                    }} placeholder="Your Store Tagline" className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Subtitle</Label>
                                                    <Input value={(section as any).subtitle || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).subtitle = e.target.value; setSections(u)
                                                    }} placeholder="Best deals on premium products" className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">CTA Button Text</Label>
                                                    <Input value={(section as any).cta_text || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).cta_text = e.target.value; setSections(u)
                                                    }} placeholder="Shop Now" className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Banner Image URL</Label>
                                                    <Input value={(section as any).banner_url || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).banner_url = e.target.value; setSections(u)
                                                    }} placeholder="https://..." className="h-10 rounded-xl" />
                                                </div>
                                            </>
                                        )}

                                        {/* Testimonials */}
                                        {section.type === "testimonials" && (
                                            <>
                                                <p className="text-xs font-bold">Customer Reviews</p>
                                                {((section as any).reviews || [{ name: "", text: "", rating: 5 }, { name: "", text: "", rating: 5 }, { name: "", text: "", rating: 5 }]).map((r: any, ri: number) => (
                                                    <div key={ri} className="grid grid-cols-2 gap-2">
                                                        <Input value={r.name || ""} onChange={e => {
                                                            const u = [...sections]
                                                            const rev = [...((u[idx] as any).reviews || [{ name: "", text: "", rating: 5 }, { name: "", text: "", rating: 5 }, { name: "", text: "", rating: 5 }])]
                                                            rev[ri] = { ...rev[ri], name: e.target.value }; (u[idx] as any).reviews = rev; setSections(u)
                                                        }} placeholder={`Reviewer ${ri + 1} name`} className="h-9 rounded-lg text-xs" />
                                                        <Input value={r.text || ""} onChange={e => {
                                                            const u = [...sections]
                                                            const rev = [...((u[idx] as any).reviews || [{ name: "", text: "", rating: 5 }, { name: "", text: "", rating: 5 }, { name: "", text: "", rating: 5 }])]
                                                            rev[ri] = { ...rev[ri], text: e.target.value }; (u[idx] as any).reviews = rev; setSections(u)
                                                        }} placeholder="Review text" className="h-9 rounded-lg text-xs" />
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        {/* FAQ */}
                                        {section.type === "faq" && (
                                            <>
                                                <p className="text-xs font-bold">FAQ Items</p>
                                                {((section as any).items || []).map((item: any, fi: number) => (
                                                    <div key={fi} className="space-y-1 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                        <Input value={item.q || ""} onChange={e => {
                                                            const u = [...sections]; const items = [...((u[idx] as any).items || [])]
                                                            items[fi] = { ...items[fi], q: e.target.value }; (u[idx] as any).items = items; setSections(u)
                                                        }} placeholder="Question" className="h-9 rounded-lg text-xs" />
                                                        <textarea value={item.a || ""} onChange={e => {
                                                            const u = [...sections]; const items = [...((u[idx] as any).items || [])]
                                                            items[fi] = { ...items[fi], a: e.target.value }; (u[idx] as any).items = items; setSections(u)
                                                        }} placeholder="Answer" rows={2} className="w-full rounded-lg border px-3 py-2 text-xs resize-none bg-background" />
                                                        <button onClick={() => {
                                                            const u = [...sections]; const items = [...((u[idx] as any).items || [])]
                                                            items.splice(fi, 1); (u[idx] as any).items = items; setSections(u)
                                                        }} className="text-red-500 text-[10px] font-bold">Remove</button>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1" onClick={() => {
                                                    const u = [...sections]; const items = [...((u[idx] as any).items || [])]
                                                    items.push({ q: "", a: "" }); (u[idx] as any).items = items; setSections(u)
                                                }}><Plus className="h-3 w-3" /> Add FAQ</Button>
                                            </>
                                        )}

                                        {/* Newsletter */}
                                        {section.type === "newsletter" && (
                                            <>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Heading</Label>
                                                    <Input value={(section as any).heading || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).heading = e.target.value; setSections(u)
                                                    }} placeholder="Stay Updated!" className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Subtext</Label>
                                                    <Input value={(section as any).subtext || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).subtext = e.target.value; setSections(u)
                                                    }} placeholder="Get exclusive deals and updates" className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Button Text</Label>
                                                    <Input value={(section as any).btn_text || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).btn_text = e.target.value; setSections(u)
                                                    }} placeholder="Subscribe" className="h-10 rounded-xl" />
                                                </div>
                                            </>
                                        )}

                                        {/* Category Pills */}
                                        {section.type === "category_pills" && (
                                            <div className="space-y-1">
                                                <Label className="text-xs font-bold">Custom Categories (comma-separated)</Label>
                                                <Input value={(section as any).categories || ""} onChange={e => {
                                                    const u = [...sections]; (u[idx] as any).categories = e.target.value; setSections(u)
                                                }} placeholder="Fashion, Electronics, Books, Health" className="h-10 rounded-xl" />
                                            </div>
                                        )}

                                        {/* Campaign Banner */}
                                        {section.type === "campaign_banner" && (
                                            <>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Campaign Title</Label>
                                                    <Input value={(section as any).campaign_title || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).campaign_title = e.target.value; setSections(u)
                                                    }} placeholder="🔥 Flash Sale!" className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Banner Image URL</Label>
                                                    <Input value={(section as any).campaign_image || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).campaign_image = e.target.value; setSections(u)
                                                    }} placeholder="https://..." className="h-10 rounded-xl" />
                                                </div>
                                            </>
                                        )}

                                        {/* Featured/New Arrivals */}
                                        {(section.type === "featured_products" || section.type === "new_arrivals") && (
                                            <>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Section Title</Label>
                                                    <Input value={(section as any).section_title || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).section_title = e.target.value; setSections(u)
                                                    }} placeholder={section.type === "featured_products" ? "Featured Products" : "New Arrivals"} className="h-10 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold">Max Products to Show</Label>
                                                    <Input type="number" value={(section as any).max_products || ""} onChange={e => {
                                                        const u = [...sections]; (u[idx] as any).max_products = parseInt(e.target.value) || 0; setSections(u)
                                                    }} placeholder="8" className="h-10 rounded-xl" />
                                                </div>
                                            </>
                                        )}

                                        <p className="text-[10px] text-muted-foreground pt-1">Changes auto-save when you click &quot;Save Theme&quot; above.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
