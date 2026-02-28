"use client"

import React, { use, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Printer, Share2, ArrowLeft, CheckCircle2, Loader2, Package, MapPin, Phone, User, CreditCard, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { toast } from "sonner"

interface OrderItem {
    id: string
    product_name: string
    variant_label: string | null
    quantity: number
    unit_price: number
}

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
    trx_id: string | null
    status: string
    otp_verified: boolean
    created_at: string
    items: OrderItem[]
}

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params)
    const [order, setOrder] = useState<OrderData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadOrder() {
            // Fetch order by order_number
            const { data: orderData, error } = await supabase
                .from("orders")
                .select("*")
                .eq("order_number", orderId)
                .single()

            if (error || !orderData) {
                setLoading(false)
                return
            }

            // Fetch order items
            const { data: items } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", orderData.id)

            setOrder({ ...orderData, items: items ?? [] })
            setLoading(false)
        }
        loadOrder()
    }, [orderId])

    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        const url = window.location.href
        if (navigator.share) {
            await navigator.share({ title: `Invoice ${orderId}`, url })
        } else {
            await navigator.clipboard.writeText(url)
            toast.success("Invoice link copied!")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 gap-4">
                <Package className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Order Not Found</h1>
                <p className="text-muted-foreground">No order found with ID: {orderId}</p>
                <Link href="/">
                    <Button variant="outline" className="rounded-xl gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Button>
                </Link>
            </div>
        )
    }

    const STATUS_COLOR: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700",
        processing: "bg-blue-100 text-blue-700",
        shipped: "bg-indigo-100 text-indigo-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Action Bar (hidden on print) */}
                <div className="flex items-center justify-between print:hidden">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-muted-foreground">
                            <ArrowLeft className="h-4 w-4" /> Home
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={handleShare}>
                            <Share2 className="h-4 w-4" /> Share
                        </Button>
                        <Button size="sm" className="rounded-xl gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={handlePrint}>
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                    </div>
                </div>

                {/* Invoice Card */}
                <Card className="rounded-2xl shadow-xl border-0 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 md:p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <h1 className="text-xl font-extrabold">Order Confirmed!</h1>
                                </div>
                                <p className="text-teal-100 text-sm">ধন্যবাদ! আপনার অর্ডারটি সফল হয়েছে।</p>
                            </div>
                            <div className="text-right">
                                <p className="text-teal-100 text-xs">Invoice</p>
                                <p className="font-extrabold text-lg">{order.order_number}</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8 space-y-6">
                        {/* Order Meta */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-semibold">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Payment</p>
                                    <p className="font-semibold capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-muted-foreground">Status:</span>
                            <Badge className={`capitalize text-xs font-bold ${STATUS_COLOR[order.status] || ""}`}>
                                {order.status}
                            </Badge>
                            {order.otp_verified && (
                                <Badge className="bg-green-100 text-green-700 text-[10px] gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> OTP Verified
                                </Badge>
                            )}
                        </div>

                        <Separator />

                        {/* Customer Info */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Delivery Details</h3>
                            <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-teal-600" />
                                    <span className="font-semibold">{order.customer_name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-teal-600" />
                                    <span>{order.customer_phone}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-teal-600 mt-0.5" />
                                    <span>{order.customer_address}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Line Items */}
                        <div>
                            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Order Items</h3>
                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={item.id || i} className="flex items-center justify-between py-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{item.product_name}</p>
                                            {item.variant_label && (
                                                <p className="text-xs text-muted-foreground">Variant: {item.variant_label}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ৳{item.unit_price.toLocaleString()}</p>
                                        </div>
                                        <p className="font-bold text-sm">৳{(item.quantity * item.unit_price).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Totals */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">৳{Number(order.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Delivery ({order.delivery_area === "outside" ? "Outside Dhaka" : "Inside Dhaka"})
                                </span>
                                <span className="font-semibold">৳{Number(order.delivery_charge).toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg pt-1">
                                <span className="font-extrabold">Total</span>
                                <span className="font-extrabold text-teal-600">৳{Number(order.total).toLocaleString()}</span>
                            </div>
                        </div>

                        {order.trx_id && (
                            <>
                                <Separator />
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Transaction ID: </span>
                                    <span className="font-mono font-bold">{order.trx_id}</span>
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <div className="text-center pt-4 text-xs text-muted-foreground space-y-1">
                            <p>Powered by <span className="font-bold text-foreground">F-Manager</span> by Team Sifr</p>
                            <p>Thank you for your order! 🎉</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
