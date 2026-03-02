"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Image from "next/image"
import {
    Plus, Loader2, Trash2, Calendar, Megaphone, Edit, ToggleLeft, ToggleRight, ImagePlus, Upload
} from "lucide-react"

interface Campaign {
    id: string
    name: string
    banner_image?: string
    discount_percent: number
    start_date: string
    end_date: string
    product_ids: string[]
    is_active: boolean
    created_at: string
}

export default function CampaignManagerPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [sellerId, setSellerId] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [bannerImage, setBannerImage] = useState("")
    const [discountPercent, setDiscountPercent] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user?.id) { setLoading(false); return }
            const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", session.user.id).single()
            if (!seller) { setLoading(false); return }
            setSellerId(seller.id)

            const { data } = await supabase.from("campaigns").select("*").eq("seller_id", seller.id).order("created_at", { ascending: false })
            setCampaigns(data ?? [])
            setLoading(false)
        }
        load()
    }, [])

    const resetForm = () => {
        setName(""); setBannerImage(""); setDiscountPercent(""); setStartDate(""); setEndDate("")
        setEditingCampaign(null)
    }

    const openEdit = (c: Campaign) => {
        setEditingCampaign(c)
        setName(c.name)
        setBannerImage(c.banner_image || "")
        setDiscountPercent(String(c.discount_percent || ""))
        setStartDate(c.start_date?.slice(0, 10) || "")
        setEndDate(c.end_date?.slice(0, 10) || "")
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!name.trim()) { toast.error("Campaign name required"); return }
        if (!startDate || !endDate) { toast.error("Start and end dates required"); return }
        setSaving(true)
        try {
            const payload = {
                seller_id: sellerId,
                name, banner_image: bannerImage || null,
                discount_percent: Number(discountPercent) || 0,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
            }
            if (editingCampaign) {
                await supabase.from("campaigns").update(payload).eq("id", editingCampaign.id)
                toast.success("Campaign updated!")
            } else {
                await supabase.from("campaigns").insert(payload)
                toast.success("Campaign created!")
            }
            setDialogOpen(false); resetForm()
            // Reload
            const { data } = await supabase.from("campaigns").select("*").eq("seller_id", sellerId).order("created_at", { ascending: false })
            setCampaigns(data ?? [])
        } catch (err: any) { toast.error(err.message || "Failed") }
        finally { setSaving(false) }
    }

    const toggleActive = async (c: Campaign) => {
        await supabase.from("campaigns").update({ is_active: !c.is_active }).eq("id", c.id)
        setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x))
        toast.success(c.is_active ? "Campaign paused" : "Campaign activated")
    }

    const deleteCampaign = async (id: string) => {
        await supabase.from("campaigns").delete().eq("id", id)
        setCampaigns(prev => prev.filter(x => x.id !== id))
        toast.success("Campaign deleted")
    }

    const getStatus = (c: Campaign) => {
        const now = new Date()
        const start = new Date(c.start_date)
        const end = new Date(c.end_date)
        if (!c.is_active) return { label: "Paused", color: "bg-neutral-200 text-neutral-600" }
        if (now < start) return { label: "Scheduled", color: "bg-blue-100 text-blue-700" }
        if (now > end) return { label: "Expired", color: "bg-red-100 text-red-600" }
        return { label: "Active", color: "bg-green-100 text-green-700" }
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Campaigns</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage promotions, flash sales, and discount campaigns</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2 font-bold">
                    <Plus className="h-4 w-4" /> New Campaign
                </Button>
            </div>

            {/* Campaign list */}
            {campaigns.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Megaphone className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <h3 className="font-bold text-lg mb-1">No Campaigns Yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">Create your first campaign to boost sales</p>
                        <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                            <Plus className="h-4 w-4" /> Create Campaign
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map(c => {
                        const status = getStatus(c)
                        return (
                            <Card key={c.id} className="overflow-hidden">
                                {c.banner_image && (
                                    <div className="h-32 relative bg-neutral-100 dark:bg-neutral-800">
                                        <Image src={c.banner_image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                                    </div>
                                )}
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold">{c.name}</h3>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        {c.discount_percent > 0 && (
                                            <span className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold">-{c.discount_percent}%</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(c.start_date).toLocaleDateString()} → {new Date(c.end_date).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs" onClick={() => openEdit(c)}>
                                            <Edit className="h-3 w-3" /> Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs" onClick={() => toggleActive(c)}>
                                            {c.is_active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                                            {c.is_active ? "Pause" : "Activate"}
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600 text-xs" onClick={() => deleteCampaign(c.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create/Edit dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <h2 className="text-lg font-extrabold">{editingCampaign ? "Edit Campaign" : "New Campaign"}</h2>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold">Campaign Name *</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Flash Sale 🔥" className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold">Banner Image URL</Label>
                                <Input value={bannerImage} onChange={e => setBannerImage(e.target.value)} placeholder="https://..." className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold">Discount %</Label>
                                <Input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} placeholder="10" className="h-10 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold">Start Date *</Label>
                                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold">End Date *</Label>
                                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10 rounded-xl" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="flex-1 rounded-xl">Cancel</Button>
                            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold gap-1">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
