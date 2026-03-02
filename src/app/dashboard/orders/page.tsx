"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Loader2, Search, FileText, Truck, Package, CheckCircle2,
    XCircle, Clock, ChevronDown, Phone, MapPin, Calendar, Eye, Printer, Target
} from "lucide-react"
import Link from "next/link"

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const
const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}
const STATUS_ICONS: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    processing: <Package className="h-3 w-3" />,
    shipped: <Truck className="h-3 w-3" />,
    delivered: <CheckCircle2 className="h-3 w-3" />,
    cancelled: <XCircle className="h-3 w-3" />,
}

interface Order {
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
    otp_verified: boolean
    created_at: string
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [sellerId, setSellerId] = useState("")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [selectedOrders, setSelectedOrders] = useState<string[]>([])

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user?.id) { setLoading(false); return }
            const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", session.user.id).single()
            if (!seller) { setLoading(false); return }
            setSellerId(seller.id)

            const { data } = await supabase
                .from("orders")
                .select("*")
                .eq("seller_id", seller.id)
                .order("created_at", { ascending: false })
            setOrders(data || [])
            setLoading(false)
        }
        load()
    }, [])

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId)
        try {
            await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId)
            // Add tracking entry
            try {
                await supabase.from("order_tracking").insert({
                    order_id: orderId,
                    status: newStatus,
                    note: `Status updated to ${newStatus}`,
                })
            } catch { /* tracking table may not exist */ }
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            toast.success(`Order updated to ${newStatus}`)
        } catch (err: any) { toast.error(err.message || "Failed to update") }
        finally { setUpdatingId(null) }
    }

    const toggleOrderSelect = (orderId: string) => {
        setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId])
    }

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedOrders([])
        } else {
            setSelectedOrders(filteredOrders.map(o => o.id))
        }
    }

    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (!selectedOrders.length) return
        setUpdatingId("bulk")
        try {
            await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).in("id", selectedOrders)
            try {
                const trackingInserts = selectedOrders.map(id => ({
                    order_id: id,
                    status: newStatus,
                    note: `Bulk status updated to ${newStatus}`,
                }))
                await supabase.from("order_tracking").insert(trackingInserts)
            } catch { /* ignore */ }

            setOrders(prev => prev.map(o => selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o))
            setSelectedOrders([])
            toast.success(`${selectedOrders.length} orders marked as ${newStatus}`)
        } catch (err: any) {
            toast.error("Bulk update failed")
        } finally {
            setUpdatingId(null)
        }
    }

    const handleBulkPrint = () => {
        if (!selectedOrders.length) return
        const url = `/invoice/bulk?ids=${selectedOrders.join(",")}`
        window.open(url, "_blank")
    }

    const filteredOrders = orders
        .filter(o => statusFilter === "all" || o.status === statusFilter)
        .filter(o =>
            !search ||
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_phone.includes(search)
        )

    // Stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "pending").length,
        processing: orders.filter(o => o.status === "processing").length,
        shipped: orders.filter(o => o.status === "shipped").length,
        delivered: orders.filter(o => o.status === "delivered").length,
        revenue: orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0),
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Orders</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage all customer orders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: "Total", value: stats.total, color: "text-neutral-700 dark:text-neutral-200" },
                    { label: "Pending", value: stats.pending, color: "text-yellow-600" },
                    { label: "Processing", value: stats.processing, color: "text-blue-600" },
                    { label: "Shipped", value: stats.shipped, color: "text-indigo-600" },
                    { label: "Delivered", value: stats.delivered, color: "text-green-600" },
                    { label: "Revenue", value: `৳${stats.revenue.toLocaleString()}`, color: "text-teal-600" },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{s.label}</p>
                        <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by order #, name, or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {["all", ...STATUS_OPTIONS].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === s
                                ? "bg-teal-600 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                                }`}
                        >
                            {s === "all" ? "All" : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions Banner */}
            {selectedOrders.length > 0 && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-teal-600 text-white font-bold text-sm h-7">{selectedOrders.length} selected</Badge>
                        <span className="text-sm font-medium text-teal-800 dark:text-teal-300">Choose an action:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            onChange={e => {
                                if (e.target.value) handleBulkStatusUpdate(e.target.value);
                                e.target.value = ""; // reset
                            }}
                            disabled={updatingId === "bulk"}
                            className="h-9 px-3 py-1 rounded-lg text-sm border-teal-200 bg-white dark:bg-neutral-800 font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-teal-600"
                        >
                            <option value="">Status Update...</option>
                            <option value="processing">Mark Processing</option>
                            <option value="shipped">Mark Shipped</option>
                            <option value="delivered">Mark Delivered</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-300 gap-2 font-bold"
                            onClick={handleBulkPrint}
                        >
                            <Printer className="h-4 w-4" /> Print Invoices
                        </Button>
                    </div>
                </div>
            )}

            {/* Select All Row */}
            {filteredOrders.length > 0 && (
                <div className="flex items-center gap-2 px-2 pb-1">
                    <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="rounded"
                    />
                    <span className="text-sm text-muted-foreground font-medium cursor-pointer" onClick={toggleSelectAll}>Select All</span>
                </div>
            )}

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map(order => (
                        <Card key={order.id} className="rounded-xl overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                    {/* Order Info */}
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="pt-1">
                                            <Checkbox
                                                checked={selectedOrders.includes(order.id)}
                                                onCheckedChange={() => toggleOrderSelect(order.id)}
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-extrabold text-sm text-teal-600">{order.order_number}</span>
                                                <Badge className={`text-[10px] font-bold gap-1 ${STATUS_COLORS[order.status] || ""}`}>
                                                    {STATUS_ICONS[order.status]} {order.status}
                                                </Badge>
                                                {order.otp_verified && (
                                                    <Badge className="bg-green-100 text-green-700 text-[10px] gap-0.5">
                                                        <CheckCircle2 className="h-2.5 w-2.5" /> OTP ✓
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {order.customer_name} — {order.customer_phone}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {order.delivery_area === "outside" ? "Outside Dhaka" : "Dhaka"}</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate max-w-xs"><MapPin className="h-3 w-3 inline mr-1" />{order.customer_address}</p>
                                        </div>
                                    </div>

                                    {/* Price + Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right mr-2">
                                            <p className="font-extrabold text-sm">৳{Number(order.total).toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground capitalize">{order.payment_method === "cod" ? "COD" : order.payment_method}</p>
                                        </div>

                                        {/* Status dropdown */}
                                        <div className="relative">
                                            <select
                                                value={order.status}
                                                onChange={e => updateStatus(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                                className="text-xs border rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-800 font-semibold appearance-none pr-6 cursor-pointer"
                                            >
                                                {STATUS_OPTIONS.map(s => (
                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                                        </div>

                                        {/* Invoice */}
                                        <Link href={`/invoice/${order.id}`} target="_blank">
                                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" title="View Invoice">
                                                <FileText className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
