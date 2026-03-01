"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
    UserPlus, Users, Shield, Trash2, Edit2,
    Loader2, ShoppingBag, PenLine, Eye, Truck, BarChart3, Save, X
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Mail } from "lucide-react"

interface Worker {
    id: string
    name: string
    phone: string
    email: string
    permissions: Record<string, boolean>
    is_active: boolean
    created_at: string
}

const PERMISSION_LIST = [
    { key: "can_add_product", label: "Add Products", icon: ShoppingBag, description: "Can add new products to the store" },
    { key: "can_edit_product", label: "Edit Products", icon: PenLine, description: "Can modify existing products" },
    { key: "can_delete_product", label: "Delete Products", icon: Trash2, description: "Can remove products from the store" },
    { key: "can_manage_orders", label: "Manage Orders", icon: Truck, description: "Can view, update and ship orders" },
    { key: "can_view_analytics", label: "View Analytics", icon: BarChart3, description: "Can access dashboard stats and charts" },
    { key: "can_manage_pos", label: "Use POS", icon: Eye, description: "Can use Quick Sell (POS) system" },
]

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
    const [sellerId, setSellerId] = useState("")
    const [storeName, setStoreName] = useState("")

    // Form state
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [permissions, setPermissions] = useState<Record<string, boolean>>({})
    const [saving, setSaving] = useState(false)

    const loadWorkers = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) { setLoading(false); return }

        const { data: seller } = await supabase.from("sellers").select("id, name").eq("user_id", userId).single()
        if (!seller) { setLoading(false); return }
        setSellerId(seller.id)
        setStoreName(seller.name)

        const { data } = await supabase
            .from("workers")
            .select("*")
            .eq("seller_id", seller.id)
            .order("created_at", { ascending: false })
        setWorkers(data ?? [])
        setLoading(false)
    }

    useEffect(() => { loadWorkers() }, [])

    const openAddDialog = () => {
        setEditingWorker(null)
        setName("")
        setPhone("")
        setEmail("")
        setPermissions({})
        setDialogOpen(true)
    }

    const openEditDialog = (w: Worker) => {
        setEditingWorker(w)
        setName(w.name)
        setPhone(w.phone || "")
        setEmail(w.email || "")
        setPermissions(w.permissions || {})
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Worker name is required")
            return
        }
        setSaving(true)
        try {
            if (editingWorker) {
                await supabase
                    .from("workers")
                    .update({ name, phone, email, permissions })
                    .eq("id", editingWorker.id)
                toast.success("Worker updated!")
            } else {
                await supabase.from("workers").insert({
                    seller_id: sellerId,
                    name,
                    phone,
                    email,
                    permissions,
                })

                // Send invitation email if worker has an email
                if (email.trim()) {
                    try {
                        const loginUrl = `${window.location.origin}/auth/worker`
                        const res = await fetch("/api/workers/invite", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                workerName: name,
                                workerEmail: email,
                                storeName,
                                permissions,
                                loginUrl,
                            }),
                        })
                        if (res.ok) {
                            toast.success("Worker added & invitation email sent! 📧")
                        } else {
                            toast.success("Worker added! (Email delivery pending)")
                        }
                    } catch {
                        toast.success("Worker added! (Email could not be sent)")
                    }
                } else {
                    toast.success("Worker added!")
                }
            }
            setDialogOpen(false)
            loadWorkers()
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (w: Worker) => {
        await supabase
            .from("workers")
            .update({ is_active: !w.is_active })
            .eq("id", w.id)
        toast.success(w.is_active ? "Worker deactivated" : "Worker activated")
        loadWorkers()
    }

    const deleteWorker = async (w: Worker) => {
        if (!confirm(`Remove ${w.name} from your team?`)) return
        await supabase.from("workers").delete().eq("id", w.id)
        toast.success("Worker removed")
        loadWorkers()
    }

    const togglePermission = (key: string) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const activePerms = (w: Worker) => Object.entries(w.permissions || {}).filter(([, v]) => v).length

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Workers & Agents</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Add team members and assign role-based permissions
                    </p>
                </div>
                <Button onClick={openAddDialog} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                    <UserPlus className="h-4 w-4" /> Add Worker
                </Button>
            </div>

            {workers.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-bold mb-2">No Workers Yet</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mb-6">
                            Add team members to help manage your store. Assign specific permissions like adding products, managing orders, or using POS.
                        </p>
                        <Button onClick={openAddDialog} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                            <UserPlus className="h-4 w-4" /> Add Your First Worker
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {workers.map((w) => (
                        <Card key={w.id} className={`transition-all ${!w.is_active ? "opacity-50" : ""}`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                                            <span className="text-lg font-bold text-teal-700 dark:text-teal-300">
                                                {w.name[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-base">{w.name}</h3>
                                                {!w.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                {w.phone && <span>{w.phone}</span>}
                                                {w.email && <span>{w.email}</span>}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {PERMISSION_LIST.filter(p => w.permissions?.[p.key]).map(p => (
                                                    <Badge key={p.key} variant="outline" className="text-[10px] gap-1 font-medium">
                                                        <p.icon className="h-2.5 w-2.5" /> {p.label}
                                                    </Badge>
                                                ))}
                                                {activePerms(w) === 0 && (
                                                    <span className="text-[10px] text-muted-foreground italic">No permissions assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Switch checked={w.is_active} onCheckedChange={() => toggleActive(w)} />
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(w)}>
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteWorker(w)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-teal-600" />
                            {editingWorker ? "Edit Worker" : "Add New Worker"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingWorker ? "Update worker details and permissions" : "Add a team member and assign their access level"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-semibold">Name <span className="text-red-500">*</span></Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Worker name" className="h-11 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="font-semibold">Phone</Label>
                                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold">Email</Label>
                                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="worker@shop.com" className="h-11 rounded-xl" />
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <Label className="font-bold text-sm mb-3 block">Permissions</Label>
                            <div className="space-y-2">
                                {PERMISSION_LIST.map(p => (
                                    <div key={p.key}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${permissions[p.key]
                                            ? "border-teal-300 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30"
                                            : "border-neutral-200 dark:border-neutral-800"
                                            }`}
                                        onClick={() => togglePermission(p.key)}>
                                        <div className="flex items-center gap-3">
                                            <p.icon className={`h-4 w-4 ${permissions[p.key] ? "text-teal-600" : "text-muted-foreground"}`} />
                                            <div>
                                                <p className="text-sm font-semibold">{p.label}</p>
                                                <p className="text-[11px] text-muted-foreground">{p.description}</p>
                                            </div>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            <Switch checked={!!permissions[p.key]} onCheckedChange={() => togglePermission(p.key)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? "Saving..." : (editingWorker ? "Update" : "Add Worker")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
