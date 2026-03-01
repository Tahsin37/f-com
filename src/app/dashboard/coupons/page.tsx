"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Plus, Ticket, Trash2, Calendar, CheckCircle2, AlertCircle } from "lucide-react"

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([])
    const [sellerId, setSellerId] = useState("")
    const [loading, setLoading] = useState(true)

    // Form
    const [code, setCode] = useState("")
    const [type, setType] = useState<"percentage" | "fixed">("percentage")
    const [value, setValue] = useState("")
    const [minOrder, setMinOrder] = useState("0")
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) return

        const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", session.user.id).single()
        if (!seller) return

        setSellerId(seller.id)

        const { data: c } = await supabase
            .from("coupons")
            .select("*")
            .eq("seller_id", seller.id)
            .order("created_at", { ascending: false })

        if (c) setCoupons(c)
        setLoading(false)
    }

    const handleCreate = async () => {
        if (!code.trim() || !value) { toast.error("Code and Discount Value are required"); return }

        setCreating(true)
        try {
            const codeUpper = code.toUpperCase().trim().replace(/\s+/g, "")
            const { error } = await supabase.from("coupons").insert({
                seller_id: sellerId,
                code: codeUpper,
                discount_type: type,
                discount_value: Number(value),
                min_order_amount: Number(minOrder) || 0,
                is_active: true
            })
            if (error) {
                if (error.code === '23505') throw new Error("A coupon with this exact code already exists")
                throw error
            }

            toast.success("Coupon created successfully")
            setCode("")
            setValue("")
            setMinOrder("0")
            loadData()
        } catch (err: any) {
            toast.error(err.message || "Failed to create coupon")
        } finally {
            setCreating(false)
        }
    }

    const toggleStatus = async (id: string, current: boolean) => {
        const { error } = await supabase.from("coupons").update({ is_active: !current }).eq("id", id)
        if (error) toast.error("Failed to update status")
        else loadData()
    }

    const deleteCoupon = async (id: string) => {
        if (!confirm("Delete this coupon permanently?")) return
        const { error } = await supabase.from("coupons").delete().eq("id", id)
        if (error) toast.error("Failed to delete coupon")
        else {
            toast.success("Coupon deleted")
            loadData()
        }
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Coupons & Discounts</h1>
                <p className="text-muted-foreground text-sm mt-1">Create promo codes to offer discounts to your customers.</p>
            </div>

            <Card className="border-teal-100 dark:border-teal-900 shadow-sm">
                <CardHeader className="bg-teal-50/50 dark:bg-teal-900/10 rounded-t-xl pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Plus className="h-4 w-4 text-teal-600" /> Create New Coupon
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid sm:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2 sm:col-span-1">
                            <Label className="text-xs font-semibold">Coupon Code</Label>
                            <Input
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                                placeholder="E.g. EID20"
                                className="h-10 uppercase font-bold tracking-widest"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Discount Type</Label>
                            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setType("percentage")}
                                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${type === "percentage" ? "bg-white dark:bg-neutral-700 shadow-sm" : ""}`}>
                                    % Percent
                                </button>
                                <button
                                    onClick={() => setType("fixed")}
                                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${type === "fixed" ? "bg-white dark:bg-neutral-700 shadow-sm" : ""}`}>
                                    ৳ Fixed
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Discount Value</Label>
                            <Input
                                type="number"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                placeholder={type === "percentage" ? "15" : "150"}
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold flex items-center gap-1">Min. Order (Optional) <span className="text-muted-foreground font-normal">৳</span></Label>
                            <Input
                                type="number"
                                value={minOrder}
                                onChange={e => setMinOrder(e.target.value)}
                                placeholder="0"
                                className="h-10"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleCreate} disabled={creating} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                            Create Coupon
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 pt-4">
                <h2 className="text-sm font-bold flex items-center gap-2">
                    <Ticket className="h-4 w-4" /> Active & Past Coupons ({coupons.length})
                </h2>

                {coupons.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-dashed rounded-xl">
                        <p className="text-muted-foreground text-sm">No coupons created yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {coupons.map((c: any) => (
                            <div key={c.id} className={`p-4 rounded-xl border flex gap-4 transition-opacity ${c.is_active ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800/50 opacity-70"}`}>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-lg font-extrabold tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-md">
                                            {c.code}
                                        </span>
                                        {!c.is_active && <span className="text-[10px] uppercase font-bold bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full">Inactive</span>}
                                    </div>

                                    <p className="text-sm font-medium">
                                        {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `৳${c.discount_value} OFF`}
                                        {c.min_order_amount > 0 && <span className="text-muted-foreground font-normal ml-1">(On orders &gt; ৳{c.min_order_amount})</span>}
                                    </p>

                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Used {c.uses_count} times
                                    </p>
                                </div>

                                <div className="flex flex-col items-end justify-between">
                                    <Switch
                                        checked={c.is_active}
                                        onCheckedChange={() => toggleStatus(c.id, c.is_active)}
                                    />
                                    <button
                                        onClick={() => deleteCoupon(c.id)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
