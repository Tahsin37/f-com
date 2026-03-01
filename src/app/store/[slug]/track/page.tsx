"use client"

import React, { use, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
    Search, Package, Truck, CheckCircle2, Clock, ArrowLeft,
    Phone, MapPin, CreditCard, ShoppingBag, Loader2, AlertCircle
} from "lucide-react"

interface OrderData {
    id: string
    order_number: string
    customer_name: string
    customer_phone: string
    customer_address: string
    delivery_area: string
    delivery_charge: number
    subtotal: number
    total: number
    payment_method: string
    status: string
    otp_code: string
    otp_verified: boolean
    created_at: string
    items: Array<{
        product_name: string
        variant_label: string | null
        quantity: number
        unit_price: number
    }>
    tracking: Array<{
        status: string
        note: string | null
        created_at: string
    }>
}

const STATUS_STEPS = [
    { key: "pending", label: "Order Placed", icon: ShoppingBag, color: "text-blue-500" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2, color: "text-teal-500" },
    { key: "processing", label: "Processing", icon: Clock, color: "text-amber-500" },
    { key: "shipped", label: "Shipped", icon: Truck, color: "text-purple-500" },
    { key: "delivered", label: "Delivered", icon: Package, color: "text-green-500" },
]

function TrackingInner({ slug }: { slug: string }) {
    const [query, setQuery] = useState("")
    const [order, setOrder] = useState<OrderData | null>(null)
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [sellerName, setSellerName] = useState("")
    const [themeColor, setThemeColor] = useState("#0d9488")

    const handleSearch = async () => {
        const q = query.trim()
        if (!q) return
        setLoading(true)
        setSearched(true)

        // Get seller
        const { data: seller } = await supabase.from("sellers").select("id, name, settings").eq("slug", slug).single()
        if (!seller) { setLoading(false); return }
        setSellerName(seller.name)
        setThemeColor(seller.settings?.theme_color || "#0d9488")

        // Search by order number or phone
        let orderQuery = supabase
            .from("orders")
            .select("*")
            .eq("seller_id", seller.id)

        if (q.startsWith("FM-")) {
            orderQuery = orderQuery.eq("order_number", q)
        } else {
            orderQuery = orderQuery.eq("customer_phone", q)
        }

        const { data: orders } = await orderQuery.order("created_at", { ascending: false }).limit(1)

        if (orders && orders.length > 0) {
            const o = orders[0]
            // Fetch order items
            const { data: items } = await supabase.from("order_items").select("product_name, variant_label, quantity, unit_price").eq("order_id", o.id)

            // Fetch tracking
            let tracking: any[] = []
            try {
                const { data: t } = await supabase.from("order_tracking").select("status, note, created_at").eq("order_id", o.id).order("created_at", { ascending: true })
                tracking = t || []
            } catch { /* tracking table may not exist */ }

            setOrder({ ...o, items: items || [], tracking })
        } else {
            setOrder(null)
        }
        setLoading(false)
    }

    const currentStepIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : -1

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-2xl mx-auto px-4 h-12 flex items-center">
                    <Link href={`/store/${slug}`} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft className="h-4 w-4" /> {sellerName || "Store"}
                    </Link>
                    <span className="flex-1 text-center text-sm font-bold">Track Order</span>
                    <div className="w-20" />
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Search */}
                <div className="text-center mb-8">
                    <Package className="h-10 w-10 mx-auto mb-3" style={{ color: themeColor }} />
                    <h1 className="text-2xl font-extrabold mb-2">Track Your Order</h1>
                    <p className="text-sm text-muted-foreground mb-6">Enter your order number or phone number</p>
                    <div className="flex gap-2 max-w-sm mx-auto">
                        <Input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="FM-XXXXXX or 01XXXXXXXXX"
                            className="h-12 rounded-xl flex-1"
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={loading}
                            className="h-12 rounded-xl px-6 text-white font-bold" style={{ backgroundColor: themeColor }}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                {searched && !loading && !order && (
                    <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border">
                        <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                        <h3 className="font-bold mb-1">Order Not Found</h3>
                        <p className="text-sm text-muted-foreground">Double-check your order number or phone number.</p>
                    </div>
                )}

                {order && (
                    <div className="space-y-4">
                        {/* Order Status Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs text-muted-foreground">Order Number</p>
                                    <p className="text-lg font-extrabold" style={{ color: themeColor }}>{order.order_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-lg font-extrabold">৳{order.total.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Status timeline */}
                            <div className="relative">
                                {STATUS_STEPS.map((step, idx) => {
                                    const completed = idx <= currentStepIdx
                                    const current = idx === currentStepIdx
                                    const StepIcon = step.icon
                                    return (
                                        <div key={step.key} className="flex gap-4 relative">
                                            {/* Vertical line */}
                                            {idx < STATUS_STEPS.length - 1 && (
                                                <div className={`absolute left-5 top-10 w-0.5 h-full ${completed && idx < currentStepIdx ? "bg-teal-400" : "bg-neutral-200 dark:bg-neutral-700"}`} />
                                            )}
                                            {/* Icon circle */}
                                            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center z-10 ${completed ? "text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                                                }`} style={completed ? { backgroundColor: themeColor } : {}}>
                                                <StepIcon className="h-4 w-4" />
                                            </div>
                                            {/* Text */}
                                            <div className="pb-8">
                                                <p className={`text-sm font-bold ${completed ? "" : "text-muted-foreground"}`}>{step.label}</p>
                                                {current && <p className="text-xs text-muted-foreground mt-0.5">Current status</p>}
                                                {/* Show tracking notes for this status */}
                                                {order.tracking
                                                    .filter(t => t.status === step.key)
                                                    .map((t, ti) => (
                                                        <div key={ti} className="mt-1">
                                                            {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
                                                            <p className="text-[10px] text-muted-foreground/60">{new Date(t.created_at).toLocaleString()}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-4 space-y-3">
                            <h3 className="text-sm font-bold">Order Details</h3>
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                    <div>
                                        <p className="font-semibold">{item.product_name}</p>
                                        {item.variant_label && <p className="text-[10px] text-muted-foreground">{item.variant_label}</p>}
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">৳{(item.unit_price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                            <div className="pt-2 space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>৳{order.delivery_charge}</span></div>
                                <div className="flex justify-between font-bold pt-1 border-t"><span>Total</span><span style={{ color: themeColor }}>৳{order.total.toLocaleString()}</span></div>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-4 space-y-2">
                            <h3 className="text-sm font-bold">Delivery Information</h3>
                            <div className="text-sm space-y-1.5">
                                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {order.customer_name} — {order.customer_phone}</p>
                                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {order.customer_address}</p>
                                <p className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> {order.payment_method.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function TrackingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    return <TrackingInner slug={slug} />
}
