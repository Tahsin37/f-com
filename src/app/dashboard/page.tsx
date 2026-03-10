"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts"
import {
    TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Truck,
    Package, AlertTriangle, Search, Send, RefreshCw,
    ArrowUpRight, ExternalLink, Filter, Loader2, Eye
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Order, Product } from "@/lib/types"
import Link from "next/link"

const SELLER_ID_PLACEHOLDER = "" // resolved at runtime from session

// ─── Status Colors ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    processing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    shipped: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
    delivered: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

// ─── Courier Modal ──────────────────────────────────────────────────────────────
function CourierModal({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: Order | null }) {
    const [loading, setLoading] = useState(false)
    const book = async () => {
        if (!order) return
        setLoading(true)
        const awb = `SF-${Math.floor(Math.random() * 100000)}`
        await supabase
            .from("orders")
            .update({ courier_awb: awb, courier_status: "Booked", status: "shipped", updated_at: new Date().toISOString() })
            .eq("id", order.id)
        setLoading(false)
        toast.success("Consignment Created!", { description: `AWB: ${awb}` })
        onClose()
    }
    if (!order) return null
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-teal-600" /> Book Courier — {order.order_number}</DialogTitle>
                    <DialogDescription>Send via Steadfast Courier</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2 text-sm">
                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Customer</span><span className="col-span-2 font-medium">{order.customer_name}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Phone</span><span className="col-span-2 font-medium">{order.customer_phone}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Address</span><span className="col-span-2 font-medium">{order.customer_address}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="font-semibold text-muted-foreground">Amount</span><span className="col-span-2 font-bold">৳{order.total?.toLocaleString()}</span></div>
                </div>
                <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={book} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {loading ? "Booking..." : "Book Courier"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState("")
    const [courierOrder, setCourierOrder] = useState<Order | null>(null)
    const [sellerId, setSellerId] = useState("")

    const loadData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) { setLoading(false); return }

        const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", userId).single()
        if (!seller) { setLoading(false); return }
        setSellerId(seller.id)

        const [ordersRes, productsRes] = await Promise.all([
            supabase.from("orders").select("*").eq("seller_id", seller.id).order("created_at", { ascending: false }),
            supabase.from("products").select("*, variants(*)").eq("seller_id", seller.id),
        ])
        setOrders(ordersRes.data ?? [])
        setProducts(productsRes.data ?? [])
        setLoading(false)
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
        setRefreshing(false)
        toast.success("Data refreshed!")
    }

    // ─── Computed Stats ────────────────────────────────────────────
    const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total || 0), 0)
    const totalOrders = orders.length
    const uniquePhones = new Set(orders.map(o => o.customer_phone)).size
    const deliveredOrders = orders.filter(o => o.status === "delivered").length
    const convRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : "0"

    const stats = [
        { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, delta: "", icon: DollarSign, color: "text-teal-600" },
        { label: "Orders", value: String(totalOrders), delta: "", icon: ShoppingCart, color: "text-indigo-600" },
        { label: "Customers", value: String(uniquePhones), delta: "", icon: Users, color: "text-violet-600" },
        { label: "Delivery Rate", value: `${convRate}%`, delta: "", icon: TrendingUp, color: "text-orange-600" },
    ]

    // ─── Chart Data ────────────────────────────────────────────────
    const categoryData = useMemo(() => {
        const cats: Record<string, number> = {}
        products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1 })
        const colors: Record<string, string> = { fashion: "#14b8a6", books: "#f59e0b", electronics: "#6366f1", grocery: "#22c55e", others: "#94a3b8" }
        return Object.entries(cats).map(([name, value]) => ({ name, value, color: colors[name] || "#94a3b8" }))
    }, [products])

    // Group orders by day for last 30 days
    const revenueData = useMemo(() => {
        const days: Record<string, number> = {}

        // Initialize last 30 days with 0
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            days[key] = 0
        }

        orders.filter(o => o.status !== "cancelled").forEach(o => {
            const d = new Date(o.created_at)
            const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            if (days[key] !== undefined) {
                days[key] += Number(o.total || 0)
            }
        })

        return Object.entries(days).map(([date, revenue]) => ({ date, revenue }))
    }, [orders])

    // ─── Inventory Alerts ──────────────────────────────────────────
    const lowStockProducts = useMemo(() => {
        return products.filter(p => {
            if (p.has_variants) {
                const totalStock = (p.variants ?? []).reduce((s, v) => s + v.stock, 0)
                return totalStock <= 5
            }
            return p.stock <= 5
        }).map(p => ({
            ...p,
            totalStock: p.has_variants ? (p.variants ?? []).reduce((s, v) => s + v.stock, 0) : p.stock,
        }))
    }, [products])

    // ─── Filtered Orders ───────────────────────────────────────────
    const filteredOrders = useMemo(() =>
        orders.filter(o =>
            o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer_phone?.includes(search)
        ), [orders, search])

    // ─── Top Customers ─────────────────────────────────────────────
    const topCustomers = useMemo(() => {
        const map: Record<string, { name: string; phone: string; orders: number; spent: number }> = {}
        orders.filter(o => o.status !== "cancelled").forEach(o => {
            if (!map[o.customer_phone]) {
                map[o.customer_phone] = { name: o.customer_name, phone: o.customer_phone, orders: 0, spent: 0 }
            }
            map[o.customer_phone].orders++
            map[o.customer_phone].spent += Number(o.total || 0)
        })
        return Object.values(map).sort((a, b) => b.spent - a.spent).slice(0, 5)
    }, [orders])

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId)
        toast.success(`Order status updated to ${newStatus}`)
        loadData()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">Sifr Style Store</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button size="sm" className="rounded-full gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => window.open("/demo/sifr-style", "_blank")}>
                        <ExternalLink className="h-4 w-4" /> View Storefront
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className="border-transparent rounded-[24px] bg-white dark:bg-neutral-900 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-neutral-800`}>
                                    <s.icon className={`h-5 w-5 ${s.color}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-extrabold tracking-tight">{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-3 rounded-[24px] border-neutral-100 dark:border-neutral-800/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-teal-600" /> Revenue (Last 30 Days)
                        </CardTitle>
                        <CardDescription>Daily sales performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-neutral-200 dark:stroke-neutral-800" />
                                    <XAxis dataKey="date" className="text-[10px] text-muted-foreground" tickLine={false} axisLine={false} minTickGap={20} />
                                    <YAxis className="text-[10px] text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, "Revenue"]}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No order data yet</div>
                        )}
                    </CardContent>
                </Card>

                {/* Category Pie */}
                <Card className="lg:col-span-2 rounded-[24px] border-neutral-100 dark:border-neutral-800/50 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-neutral-900 dark:to-neutral-950">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Products by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                        {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v} products`, "Count"]} />
                                    <Legend formatter={(v) => <span className="text-xs font-medium text-foreground">{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No products yet</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <Card className="rounded-[24px] border-l-4 border-l-amber-500 shadow-sm" id="products">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" /> Inventory Alerts
                            <Badge variant="destructive" className="ml-auto text-[10px]">{lowStockProducts.length} Low Stock</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0">
                                <div>
                                    <p className="font-semibold text-sm">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.category}</p>
                                </div>
                                <span className={`text-xs font-bold ${p.totalStock === 0 ? "text-red-500" : "text-amber-500"}`}>
                                    {p.totalStock === 0 ? "Out of Stock" : `${p.totalStock} left`}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Recent Orders */}
            <Card className="rounded-[24px] border-neutral-100 dark:border-neutral-800/50 shadow-sm overflow-hidden" id="orders">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800/50">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-indigo-600" /> Recent Orders
                    </CardTitle>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-sm rounded-xl border-neutral-200 dark:border-neutral-800 focus-visible:ring-teal-500" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            {orders.length === 0 ? "No orders yet. Orders will appear here when customers purchase from your storefront." : "No matching orders found."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800/50 bg-slate-50/50 dark:bg-neutral-900/20">
                                        <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">ORDER</th>
                                        <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">CUSTOMER</th>
                                        <th className="text-right px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">AMOUNT</th>
                                        <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">STATUS</th>
                                        <th className="text-right px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.slice(0, 20).map((o) => (
                                        <tr key={o.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-slate-50/80 dark:hover:bg-neutral-900/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-teal-600 text-[13px]">{o.order_number}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-[13px]">{o.customer_name}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{o.customer_phone}</p>
                                            </td>
                                            <td className="px-5 py-4 text-right font-bold text-[13px]">৳{Number(o.total).toLocaleString()}</td>
                                            <td className="px-5 py-4">
                                                <Badge className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md ${STATUS_COLORS[o.status] || ""}`}>
                                                    {o.status}
                                                </Badge>
                                                {!o.otp_verified && o.status === "pending" && (
                                                    <span className="text-[9px] text-amber-500 ml-1 font-medium">⚠ OTP</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/invoice/${o.id}`} target="_blank">
                                                        <Button size="sm" variant="outline" className="h-8 text-[11px] font-semibold rounded-lg gap-1.5 shadow-sm border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800 transition-colors">
                                                            📄 Invoice
                                                        </Button>
                                                    </Link>
                                                    {(o.status === "pending" || o.status === "processing") && (
                                                        <Button size="sm" className="h-8 text-[11px] font-semibold rounded-lg gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                                                            onClick={() => setCourierOrder(o)}>
                                                            <Truck className="h-3 w-3" /> Ship
                                                        </Button>
                                                    )}
                                                    {o.courier_awb && (
                                                        <span className="text-[11px] font-medium text-muted-foreground bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{o.courier_awb}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Customers */}
            {topCustomers.length > 0 && (
                <Card className="rounded-[24px] border-neutral-100 dark:border-neutral-800/50 shadow-sm overflow-hidden" id="customers">
                    <CardHeader className="bg-slate-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800/50">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Users className="h-4 w-4 text-violet-600" /> Top Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 dark:border-neutral-800/50 bg-slate-50/50 dark:bg-neutral-900/20">
                                        <th className="text-left px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                                        <th className="text-right px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Orders</th>
                                        <th className="text-right px-5 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topCustomers.map((c, idx) => (
                                        <tr key={c.phone} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-slate-50/80 dark:hover:bg-neutral-900/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-900/50 flex items-center justify-center text-sm font-bold text-teal-700 dark:text-teal-300 ring-4 ring-white dark:ring-neutral-950 shadow-sm">{c.name[0]}</div>
                                                    <div>
                                                        <p className="font-bold text-[13px]">{c.name}</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-bold text-[13px]">{c.orders}</td>
                                            <td className="px-5 py-4 text-right font-black text-teal-600 text-[13px]">৳{c.spent.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Courier Modal */}
            <CourierModal isOpen={!!courierOrder} onClose={() => { setCourierOrder(null); loadData() }} order={courierOrder} />
        </div>
    )
}
