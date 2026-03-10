"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
    Save, Store, Image as ImageIcon, Palette, Eye, ExternalLink,
    Loader2, Paintbrush, AlignLeft, Type, Tag, Upload, X,
    Smartphone, Tablet, Monitor, GripVertical
} from "lucide-react"
import Link from "next/link"
import { getStoreUrl } from "@/lib/utils"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

const THEME_COLORS = [
    { label: "Teal", value: "#0d9488" },
    { label: "Indigo", value: "#4f46e5" },
    { label: "Rose", value: "#e11d48" },
    { label: "Amber", value: "#d97706" },
    { label: "Violet", value: "#7c3aed" },
    { label: "Slate", value: "#475569" },
]

interface StoreSettings {
    store_tagline: string
    theme_color: string
    banner_images: string[]
    banner_title: string
    banner_subtitle: string
    banner_cta: string
    banner_slider_speed: number
    delivery_inside: number
    delivery_outside: number
}

const DEFAULT: StoreSettings = {
    store_tagline: "Best quality products with fast delivery across Bangladesh! 🇧🇩",
    theme_color: "#0d9488",
    banner_images: [],
    banner_title: "New Arrivals 🔥",
    banner_subtitle: "Free delivery on orders above ৳999. Shop the latest collection.",
    banner_cta: "Shop Now",
    banner_slider_speed: 3,
    delivery_inside: 60,
    delivery_outside: 120,
}

export default function StoreBuilderPage() {
    const [sellerSlug, setSellerSlug] = useState("")
    const [storeName, setStoreName] = useState("")
    const [sellerId, setSellerId] = useState("")
    const [settings, setSettings] = useState<StoreSettings>(DEFAULT)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile")

    useEffect(() => {
        async function load() {
            // Get current user
            const { data: { session } } = await supabase.auth.getSession()
            const userId = session?.user?.id
            if (!userId) { setLoading(false); return }

            const { data } = await supabase
                .from("sellers")
                .select("id, name, slug, settings")
                .eq("user_id", userId)
                .single()

            if (data) {
                setSellerId(data.id)
                setStoreName(data.name)
                setSellerSlug(data.slug)
                setSettings({ ...DEFAULT, ...(data.settings || {}) })
            }
            setLoading(false)
        }
        load()
    }, [])

    const update = (k: keyof StoreSettings, v: string | number | string[]) =>
        setSettings(s => ({ ...s, [k]: v }))

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from("sellers")
                .update({
                    name: storeName,
                    settings,
                })
                .eq("id", sellerId)
            if (error) throw error
            toast.success("Store updated! Changes are live on your storefront ✨")
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        setUploadingBanner(true)
        try {
            const uploadedUrls: string[] = []
            for (const file of files) {
                const ext = file.name.split('.').pop()
                const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
                const { data, error } = await supabase.storage.from("product-images").upload(`banners/${fileName}`, file, { cacheControl: "3600", upsert: false })
                if (error) throw error
                const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path)
                uploadedUrls.push(publicUrl)
            }
            update("banner_images", [...(settings.banner_images || []), ...uploadedUrls])
            toast.success(`Successfully uploaded ${files.length} banner(s) ✨`)
        } catch (err: any) {
            toast.error(err.message || "Failed to upload banner(s)")
        } finally {
            setUploadingBanner(false)
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return
        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index

        if (sourceIndex === destinationIndex) return

        const currentImages = Array.from(settings.banner_images || [])
        const [reorderedItem] = currentImages.splice(sourceIndex, 1)
        currentImages.splice(destinationIndex, 0, reorderedItem)

        update("banner_images", currentImages)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        )
    }

    const bgColor = settings.theme_color || "#0d9488"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Store Builder</h1>
                    <p className="text-muted-foreground text-sm mt-1">Customise your storefront — changes go live instantly</p>
                </div>
                <div className="flex gap-2">
                    {sellerSlug && (
                        <a href={getStoreUrl(sellerSlug)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="rounded-xl gap-2">
                                <ExternalLink className="h-4 w-4" /> Preview Store
                            </Button>
                        </a>
                    )}
                    <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Store Identity */}
                    <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Store className="h-4 w-4 text-teal-600" /> Store Identity
                            </CardTitle>
                            <CardDescription>Your brand name and tagline</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm">Store Name</Label>
                                <Input
                                    value={storeName}
                                    onChange={e => setStoreName(e.target.value)}
                                    placeholder="My Awesome Store"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm flex items-center gap-1.5">
                                    <AlignLeft className="h-3.5 w-3.5" /> Tagline
                                </Label>
                                <Input
                                    value={settings.store_tagline}
                                    onChange={e => update("store_tagline", e.target.value)}
                                    placeholder="Best quality products in Bangladesh 🇧🇩"
                                    className="h-11 rounded-xl"
                                />
                                <p className="text-xs text-muted-foreground">Shown below your store name on the storefront</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Theme Color */}
                    <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Palette className="h-4 w-4 text-teal-600" /> Theme Color
                            </CardTitle>
                            <CardDescription>Accent color for your store buttons and highlights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {THEME_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        title={c.label}
                                        onClick={() => update("theme_color", c.value)}
                                        className={`h-9 w-9 rounded-full border-2 transition-all hover:scale-110 ${settings.theme_color === c.value ? "border-foreground scale-110 shadow-lg" : "border-transparent"}`}
                                        style={{ backgroundColor: c.value }}
                                    />
                                ))}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.theme_color}
                                        onChange={e => update("theme_color", e.target.value)}
                                        className="h-9 w-9 rounded-full cursor-pointer border-2 border-neutral-200"
                                        title="Custom color"
                                    />
                                    <span className="text-xs text-muted-foreground font-mono">{settings.theme_color}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hero Banner */}
                    <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-teal-600" /> Hero Banner
                            </CardTitle>
                            <CardDescription>The big banner at the top of your storefront</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5" /> Banner Image
                                </Label>
                                <div className="flex flex-col gap-4">
                                    {settings.banner_images && settings.banner_images.length > 0 && (
                                        <DragDropContext onDragEnd={onDragEnd}>
                                            <Droppable droppableId="banner-images" direction="vertical">
                                                {(provided) => (
                                                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                                                        {settings.banner_images.map((img, idx) => (
                                                            <Draggable key={img} draggableId={img} index={idx}>
                                                                {(provided, snapshot) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        className={`relative w-full h-24 sm:h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-2 transition-all flex items-center group ${snapshot.isDragging ? "border-teal-500 shadow-xl scale-[1.02] z-50" : "border-neutral-200 dark:border-neutral-700"}`}
                                                                    >
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 dark:bg-black/60 rounded-md backdrop-blur-sm cursor-grab active:cursor-grabbing text-neutral-600 dark:text-neutral-300 z-20 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <GripVertical className="h-4 w-4" />
                                                                        </div>
                                                                        <img src={img} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="destructive"
                                                                            className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => update("banner_images", settings.banner_images.filter((_, i) => i !== idx))}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                        <div className="absolute bottom-2 left-10 py-0.5 px-2 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-medium z-10">
                                                                            Slide {idx + 1}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" className="relative h-11 px-4 rounded-xl cursor-pointer bg-neutral-50 dark:bg-neutral-900 border-dashed border-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full sm:w-auto" disabled={uploadingBanner}>
                                            <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleBannerUpload} disabled={uploadingBanner} />
                                            {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                            {uploadingBanner ? "Uploading..." : "Upload New Banner Image"}
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <p>Upload multiple images to create a sliding hero banner.</p>
                                    </div>
                                    {settings.banner_images && settings.banner_images.length > 1 && (
                                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="font-semibold text-sm">Auto-Slide Speed (Seconds)</Label>
                                                <span className="text-xs font-bold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">{settings.banner_slider_speed || 3}s</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="2"
                                                max="15"
                                                step="1"
                                                value={settings.banner_slider_speed || 3}
                                                onChange={e => update("banner_slider_speed", Number(e.target.value))}
                                                className="w-full accent-teal-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-sm flex items-center gap-1.5">
                                        <Type className="h-3.5 w-3.5" /> Headline
                                    </Label>
                                    <Input
                                        value={settings.banner_title}
                                        onChange={e => update("banner_title", e.target.value)}
                                        placeholder="New Arrivals 🔥"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-sm flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" /> Button Text
                                    </Label>
                                    <Input
                                        value={settings.banner_cta}
                                        onChange={e => update("banner_cta", e.target.value)}
                                        placeholder="Shop Now"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm">Subtitle</Label>
                                <Input
                                    value={settings.banner_subtitle}
                                    onChange={e => update("banner_subtitle", e.target.value)}
                                    placeholder="Free delivery on orders above ৳999"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Charges */}
                    <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Paintbrush className="h-4 w-4 text-teal-600" /> Delivery Charges
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm">Inside Dhaka (৳)</Label>
                                <Input
                                    type="number"
                                    value={settings.delivery_inside}
                                    onChange={e => update("delivery_inside", Number(e.target.value))}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm">Outside Dhaka (৳)</Label>
                                <Input
                                    type="number"
                                    value={settings.delivery_outside}
                                    onChange={e => update("delivery_outside", Number(e.target.value))}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Live Preview */}
                <div className="space-y-4">
                    <Card className="rounded-2xl border-neutral-200 dark:border-neutral-800 sticky top-6">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-teal-600" /> Live Preview
                                </CardTitle>
                                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                                    <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded-md transition-colors ${previewDevice === "mobile" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                        <Smartphone className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => setPreviewDevice("tablet")} className={`p-1.5 rounded-md transition-colors ${previewDevice === "tablet" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                        <Tablet className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded-md transition-colors ${previewDevice === "desktop" ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                                        <Monitor className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 flex justify-center bg-neutral-50/50 dark:bg-neutral-900/20 rounded-b-2xl">
                            {/* Mini storefront preview */}
                            <div className={`rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all duration-500 ease-in-out bg-white dark:bg-[#0a0a0a] ${previewDevice === "mobile" ? "w-[280px]" :
                                previewDevice === "tablet" ? "w-[400px]" : "w-full"
                                }`}>
                                {/* Header row */}
                                <div className="bg-white dark:bg-neutral-900 px-3 py-2 flex items-center justify-between border-b">
                                    <span className="text-xs font-extrabold" style={{ color: bgColor }}>
                                        {storeName || "My Store"}
                                    </span>
                                    <div className="h-5 w-5 rounded-full" style={{ backgroundColor: bgColor + "33" }}>
                                        <div className="h-full w-full flex items-center justify-center text-[8px]">🛒</div>
                                    </div>
                                </div>

                                {/* Banner */}
                                <div
                                    className="relative h-28 flex flex-col items-start justify-end p-3"
                                    style={{
                                        backgroundImage: settings.banner_images?.[0] ? `url(${settings.banner_images[0]})` : undefined,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundColor: settings.banner_images?.[0] ? undefined : bgColor,
                                        background: settings.banner_images?.[0] ? undefined : `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`,
                                    }}
                                >
                                    {!settings.banner_images?.[0] && (
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute top-2 right-2 h-16 w-16 rounded-full bg-white blur-2xl" />
                                        </div>
                                    )}
                                    <div className="relative z-10">
                                        <p className="text-white text-[10px] font-extrabold leading-tight drop-shadow">
                                            {settings.banner_title || "Your Headline"}
                                        </p>
                                        <p className="text-white/80 text-[8px] mt-0.5 leading-tight">
                                            {settings.banner_subtitle || "Your subtitle text"}
                                        </p>
                                        <div
                                            className="mt-1.5 px-2 py-0.5 rounded text-[8px] font-bold text-white inline-block"
                                            style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                                        >
                                            {settings.banner_cta || "Shop Now"}
                                        </div>
                                    </div>
                                </div>

                                {/* Mini product grid */}
                                <div className="bg-neutral-50 dark:bg-neutral-950 p-2 grid grid-cols-3 gap-1.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800">
                                            <div className="bg-neutral-100 dark:bg-neutral-800 aspect-square" />
                                            <div className="p-1">
                                                <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-1" />
                                                <div className="h-2 rounded w-1/2" style={{ backgroundColor: bgColor + "66" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="my-3" />

                            {sellerSlug && (
                                <a href={getStoreUrl(sellerSlug)} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5">
                                        <ExternalLink className="h-3.5 w-3.5" /> Open Live Store
                                    </Button>
                                </a>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
