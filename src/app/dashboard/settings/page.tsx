"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Loader2, Store, Key, MapPin, Truck, Megaphone, Globe, Facebook, Instagram, ImageIcon, Upload } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import type { Seller } from "@/lib/types"

export default function SettingsPage() {
    const [seller, setSeller] = useState<Seller | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form fields
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [deliveryInside, setDeliveryInside] = useState("60")
    const [deliveryOutside, setDeliveryOutside] = useState("120")
    const [steadfastKey, setSteadfastKey] = useState("")
    const [steadfastSecret, setSteadfastSecret] = useState("")

    // Announcement Bar
    const [announcementEnabled, setAnnouncementEnabled] = useState(false)
    const [announcementText, setAnnouncementText] = useState("")
    const [announcementBg, setAnnouncementBg] = useState("#000000")
    const [announcementColor, setAnnouncementColor] = useState("#ffffff")

    // Social Links
    const [facebookUrl, setFacebookUrl] = useState("")
    const [instagramUrl, setInstagramUrl] = useState("")

    // Hero Banner
    const [bannerImage, setBannerImage] = useState("")
    const [bannerTitle, setBannerTitle] = useState("")
    const [bannerSubtitle, setBannerSubtitle] = useState("")
    const [bannerCta, setBannerCta] = useState("")
    const [uploadingBanner, setUploadingBanner] = useState(false)

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession()
            const userId = session?.user?.id
            if (!userId) { setLoading(false); return }

            const { data } = await supabase
                .from("sellers")
                .select("*")
                .eq("user_id", userId)
                .single()

            if (data) {
                setSeller(data)
                setName(data.name)
                setPhone(data.phone || "")
                setEmail(data.email || "")
                setDeliveryInside(String(data.settings?.delivery_inside ?? 60))
                setDeliveryOutside(String(data.settings?.delivery_outside ?? 120))
                setSteadfastKey(data.api_keys?.steadfast_key || "")
                setSteadfastSecret(data.api_keys?.steadfast_secret || "")
                setAnnouncementEnabled(data.settings?.announcement_bar?.enabled || false)
                setAnnouncementText(data.settings?.announcement_bar?.text || "")
                setAnnouncementBg(data.settings?.announcement_bar?.bg_color || "#000000")
                setAnnouncementColor(data.settings?.announcement_bar?.text_color || "#ffffff")
                setFacebookUrl(data.settings?.footer?.social?.facebook || "")
                setInstagramUrl(data.settings?.footer?.social?.instagram || "")
                setBannerImage(data.settings?.banner_image || "")
                setBannerTitle(data.settings?.banner_title || "")
                setBannerSubtitle(data.settings?.banner_subtitle || "")
                setBannerCta(data.settings?.banner_cta || "")
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from("sellers")
                .update({
                    name,
                    phone: phone || null,
                    email: email || null,
                    settings: {
                        ...seller!.settings,
                        banner_image: bannerImage,
                        banner_title: bannerTitle,
                        banner_subtitle: bannerSubtitle,
                        banner_cta: bannerCta,
                        delivery_inside: Number(deliveryInside) || 60,
                        delivery_outside: Number(deliveryOutside) || 120,
                        announcement_bar: {
                            enabled: announcementEnabled,
                            text: announcementText,
                            bg_color: announcementBg,
                            text_color: announcementColor
                        },
                        footer: {
                            ...seller?.settings?.footer,
                            columns: seller?.settings?.footer?.columns || [],
                            social: {
                                ...seller?.settings?.footer?.social,
                                facebook: facebookUrl,
                                instagram: instagramUrl
                            }
                        }
                    },
                    api_keys: {
                        steadfast_key: steadfastKey || "",
                        steadfast_secret: steadfastSecret || "",
                    },
                })
                .eq("id", seller!.id)

            if (error) throw error
            toast.success("Settings saved!")
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingBanner(true)
        try {
            const ext = file.name.split('.').pop()
            const fileName = `banner-${Date.now()}.${ext}`
            const { data, error } = await supabase.storage.from("product-images").upload(`banners/${fileName}`, file, { cacheControl: "3600", upsert: false })
            if (error) throw error
            const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path)
            setBannerImage(publicUrl)
            toast.success("Banner uploaded")
        } catch (err: any) {
            toast.error(err.message || "Failed to upload banner")
        } finally {
            setUploadingBanner(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your store profile, delivery charges, and API keys</p>
            </div>

            {/* Store Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Store className="h-4 w-4 text-teal-600" /> Store Profile
                    </CardTitle>
                    <CardDescription>Your store&apos;s basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-semibold">Store Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Phone</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Email</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@shop.com" className="h-11 rounded-xl" />
                        </div>
                    </div>
                    {seller?.slug && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 text-sm">
                            <p className="text-muted-foreground mb-1">Your storefront URL:</p>
                            <code className="text-teal-600 font-mono font-bold">/store/{seller.slug}</code>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delivery Charges */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Truck className="h-4 w-4 text-indigo-600" /> Delivery Charges
                    </CardTitle>
                    <CardDescription>Auto-applied during checkout</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> Inside Dhaka (৳)
                            </Label>
                            <Input type="number" value={deliveryInside} onChange={e => setDeliveryInside(e.target.value)} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> Outside Dhaka (৳)
                            </Label>
                            <Input type="number" value={deliveryOutside} onChange={e => setDeliveryOutside(e.target.value)} className="h-11 rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Storefront Customization */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-rose-600" /> Announcement Bar
                    </CardTitle>
                    <CardDescription>Display a banner at the very top of your store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="font-semibold">Enable Announcement Bar</Label>
                            <p className="text-sm text-muted-foreground">Turn the top banner on or off.</p>
                        </div>
                        <Switch checked={announcementEnabled} onCheckedChange={setAnnouncementEnabled} />
                    </div>
                    {announcementEnabled && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="font-semibold">Announcement Text</Label>
                                <Input value={announcementText} onChange={e => setAnnouncementText(e.target.value)} placeholder="Free delivery on orders over ৳1000!" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input type="color" value={announcementBg} onChange={e => setAnnouncementBg(e.target.value)} className="h-11 w-11 rounded-xl p-1 cursor-pointer shrink-0" />
                                    <Input value={announcementBg} onChange={e => setAnnouncementBg(e.target.value)} className="h-11 rounded-xl font-mono uppercase text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold">Text Color</Label>
                                <div className="flex gap-2">
                                    <Input type="color" value={announcementColor} onChange={e => setAnnouncementColor(e.target.value)} className="h-11 w-11 rounded-xl p-1 cursor-pointer shrink-0" />
                                    <Input value={announcementColor} onChange={e => setAnnouncementColor(e.target.value)} className="h-11 rounded-xl font-mono uppercase text-sm" />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Storefront Hero Banner Customization */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-purple-600" /> Hero Banner
                    </CardTitle>
                    <CardDescription>Customize the main banner of your storefront</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-semibold">Banner Image</Label>
                        <div className="flex flex-col gap-4">
                            {bannerImage && (
                                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                    <img src={bannerImage} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => setBannerImage("")}>Remove</Button>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" className="relative h-11 px-4 rounded-xl cursor-pointer" disabled={uploadingBanner}>
                                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleBannerUpload} disabled={uploadingBanner} />
                                    {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                    {uploadingBanner ? "Uploading..." : bannerImage ? "Change Image" : "Upload Banner Image"}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Title</Label>
                            <Input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} placeholder="E.g. Summer Collection" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Subtitle</Label>
                            <Input value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)} placeholder="E.g. 50% off all items" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Button URL or Text</Label>
                            <Input value={bannerCta} onChange={e => setBannerCta(e.target.value)} placeholder="E.g. Shop Now" className="h-11 rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" /> Social Links
                    </CardTitle>
                    <CardDescription>Connect your social media accounts to display in the store footer</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold flex items-center gap-1">
                                <Facebook className="h-3.5 w-3.5" /> Facebook URL
                            </Label>
                            <Input value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourstore" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold flex items-center gap-1">
                                <Instagram className="h-3.5 w-3.5" /> Instagram URL
                            </Label>
                            <Input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourstore" className="h-11 rounded-xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Key className="h-4 w-4 text-amber-600" /> Courier API Keys
                    </CardTitle>
                    <CardDescription>Connect your Steadfast courier account for 1-click booking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-semibold">Steadfast API Key</Label>
                        <Input value={steadfastKey} onChange={e => setSteadfastKey(e.target.value)} placeholder="Enter your API key" className="h-11 rounded-xl font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-semibold">Steadfast Secret Key</Label>
                        <Input type="password" value={steadfastSecret} onChange={e => setSteadfastSecret(e.target.value)} placeholder="Enter your secret key" className="h-11 rounded-xl font-mono text-sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Get your API keys from <a href="https://steadfast.com.bd" target="_blank" className="text-teal-600 underline">steadfast.com.bd</a>
                    </p>
                </CardContent>
            </Card>

            <Separator />

            {/* Save */}
            <Button onClick={handleSave} disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 font-bold gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Settings"}
            </Button>
        </div>
    )
}
