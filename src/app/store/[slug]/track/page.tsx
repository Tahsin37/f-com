"use client"

import React, { use, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Search, MapPin, Phone, Truck, CheckCircle2, Copy } from "lucide-react"
import Link from "next/link"

export default function TrackOrderPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)

    const [sellerId, setSellerId] = useState("")
    const [themeColor, setThemeColor] = useState("#0d9488")
    const [storeName, setStoreName] = useState("")

    const [orderNumber, setOrderNumber] = useState("")
    const [phone, setPhone] = useState("")

    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [order, setOrder] = useState<any>(null)

    useEffect(() => {
        async function loadStore() {
            const { data: seller } = await supabase
                .from("sellers")
                .select("id, name, settings")
                .eq("slug", slug)
                .single()

            if (seller) {
                setSellerId(seller.id)
                setStoreName(seller.name)
                setThemeColor(seller.settings?.theme_color || "#0d9488")
            }
            setLoading(false)
        }
        loadStore()
    }, [slug])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderNumber || !phone) {
            toast.error("Please enter both Order Number and Phone Number")
            return
        }

        setSearching(true)
        setOrder(null)

        const formattedOrderNumber = orderNumber.trim().toUpperCase()

        const { data, error } = await supabase
            .from("orders")
            .select(`
                *,
                order_items (*),
                tracking:order_tracking (*)
            `)
            .eq("seller_id", sellerId)
            .eq("order_number", formattedOrderNumber)
            .eq("customer_phone", phone.trim())
            .single()

        setSearching(false)

        if (error || !data) {
            toast.error("Order not found or details mismatch.")
        } else {
            setOrder(data)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col">
            <header className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft className="h-5 w-5" /> Back to Store
                    </Link>
                    <span className="font-extrabold text-lg" style={{ color: themeColor }}>{storeName}</span>
                    <div className="w-24" /> {/* Spacer */}
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-10 mt-6">
                    <div className="h-16 w-16 mx-auto bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 dark:border-neutral-800 mb-4">
                        <Search className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Track Your Order</h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">Enter your order ID and the phone number used during checkout to see the current status of your delivery.</p>
                </div>

                <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sm:p-8 max-w-xl mx-auto">
                    <form onSubmit={handleSearch} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" /> Order Number
                            </label>
                            <Input
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                placeholder="e.g. FM-XXXXXX"
                                className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                            </label>
                            <Input
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={searching || !orderNumber || !phone}
                            className="w-full h-14 rounded-xl font-extrabold text-white text-base shadow-xl transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: themeColor }}
                        >
                            {searching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Track Order"}
                        </Button>
                    </form>
                </div>

                {order && (
                    <div className="mt-12 bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        {/* Order Header Info */}
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold font-mono tracking-tight flex items-center gap-2">
                                    {order.order_number}
                                    <button onClick={() => copyToClipboard(order.order_number)} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition text-muted-foreground"><Copy className="h-3.5 w-3.5" /></button>
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-0">
                            {/* Tracking Timeline */}
                            <div className="md:col-span-2 p-6 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
                                <h3 className="font-bold mb-6 text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground"><MapPin className="h-4 w-4" /> Timeline</h3>

                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800 last:before:h-[calc(100%-1.5rem)]">
                                    {/* Default placed status */}
                                    <div className="relative flex items-center justify-start md:justify-center">
                                        <div className="h-5 w-5 rounded-full bg-white dark:bg-neutral-900 border-2 border-green-500 z-10 shrink-0" />
                                        <div className="ml-4 md:ml-0 md:absolute md:left-1/2 md:-translate-x-full md:pr-6 md:w-[150px] md:text-right">
                                            <p className="text-sm font-bold text-green-600 dark:text-green-500">Order Placed</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Additional Tracking from DB */}
                                    {(order.tracking || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((track: any, i: number) => (
                                        <div key={i} className="relative flex items-center justify-start md:justify-center">
                                            <div className="h-5 w-5 rounded-full bg-white dark:bg-neutral-900 border-2 border-blue-500 z-10 shrink-0 flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                            </div>
                                            <div className="ml-4 md:ml-0 md:absolute md:left-1/2 md:translate-x-0 md:pl-6 md:w-[150px] md:text-left">
                                                <p className="text-sm font-bold capitalize text-blue-600 dark:text-blue-400">{track.status}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(track.created_at).toLocaleString()}</p>
                                                {track.note && <p className="text-xs text-muted-foreground mt-0.5">{track.note}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="md:col-span-3 p-6 bg-neutral-50/30 dark:bg-neutral-900/10">
                                <h3 className="font-bold mb-4 text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">Order Details</h3>

                                <div className="space-y-4 mb-6">
                                    {order.order_items?.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div className="flex-1">
                                                <span className="font-semibold">{item.product_name}</span>
                                                <span className="text-muted-foreground mx-2">x{item.quantity}</span>
                                                {item.variant_label && <p className="text-xs text-muted-foreground">{item.variant_label}</p>}
                                            </div>
                                            <span className="font-bold">৳{(item.unit_price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>৳{order.subtotal?.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>৳{order.delivery_charge}</span></div>
                                    {order.subtotal + order.delivery_charge > order.total && (
                                        <div className="flex justify-between text-green-600 dark:text-green-500">
                                            <span>Discount</span>
                                            <span>-৳{(order.subtotal + order.delivery_charge - order.total).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <span>Total</span>
                                        <span style={{ color: themeColor }}>৳{order.total?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivery Details</h4>
                                    <p className="text-sm font-semibold">{order.customer_name}</p>
                                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{order.customer_phone}</p>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{order.customer_address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
