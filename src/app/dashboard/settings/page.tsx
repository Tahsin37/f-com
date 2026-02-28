"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Save, Loader2, Store, Key, MapPin, Truck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Seller } from "@/lib/types"

const SELLER_ID = "a0000000-0000-0000-0000-000000000001"

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

    useEffect(() => {
        supabase
            .from("sellers")
            .select("*")
            .eq("id", SELLER_ID)
            .single()
            .then(({ data }) => {
                if (data) {
                    setSeller(data)
                    setName(data.name)
                    setPhone(data.phone || "")
                    setEmail(data.email || "")
                    setDeliveryInside(String(data.settings?.delivery_inside ?? 60))
                    setDeliveryOutside(String(data.settings?.delivery_outside ?? 120))
                    setSteadfastKey(data.api_keys?.steadfast_key || "")
                    setSteadfastSecret(data.api_keys?.steadfast_secret || "")
                }
                setLoading(false)
            })
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
                        delivery_inside: Number(deliveryInside) || 60,
                        delivery_outside: Number(deliveryOutside) || 120,
                    },
                    api_keys: {
                        steadfast_key: steadfastKey || "",
                        steadfast_secret: steadfastSecret || "",
                    },
                })
                .eq("id", SELLER_ID)

            if (error) throw error
            toast.success("Settings saved!")
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSaving(false)
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
        <div className="max-w-2xl space-y-6">
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
                            <code className="text-teal-600 font-mono font-bold">/demo/{seller.slug}</code>
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
