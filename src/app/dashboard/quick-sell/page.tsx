"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Search, Plus, Minus, ShoppingCart, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"

const SELLER_ID = "a0000000-0000-0000-0000-000000000001"

interface CartItem {
    id: string
    name: string
    price: number
    qty: number
    product_id: string
}

export default function QuickSellPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [posCart, setPosCart] = useState<CartItem[]>([])
    const [customerName, setCustomerName] = useState("")
    const [completed, setCompleted] = useState(false)
    const [lastSaleId, setLastSaleId] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        supabase
            .from("products")
            .select("*, variants(*)")
            .eq("seller_id", SELLER_ID)
            .eq("is_active", true)
            .order("name")
            .then(({ data }) => {
                setProducts(data ?? [])
                setLoading(false)
            })
    }, [])

    const getStock = (p: Product) => {
        if (p.has_variants) return (p.variants ?? []).reduce((s, v) => s + v.stock, 0)
        return p.stock
    }

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const addToPOS = (product: Product) => {
        setPosCart((prev) => {
            const exists = prev.find((c) => c.id === product.id)
            if (exists) {
                return prev.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
            }
            const price = product.discount > 0
                ? Math.round(product.selling_price * (1 - product.discount / 100))
                : product.selling_price
            return [...prev, { id: product.id, name: product.name, price, qty: 1, product_id: product.id }]
        })
    }

    const removeFromPOS = (id: string) => {
        setPosCart((prev) => {
            const item = prev.find((c) => c.id === id)
            if (item && item.qty > 1) {
                return prev.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c)
            }
            return prev.filter((c) => c.id !== id)
        })
    }

    const posTotal = posCart.reduce((sum, c) => sum + c.price * c.qty, 0)

    const completeSale = async () => {
        if (posCart.length === 0) {
            toast.error("Add products to the sale first!")
            return
        }
        setSaving(true)

        const saleNumber = `POS-${Math.floor(10000 + Math.random() * 90000)}`

        try {
            // Insert POS sale
            const { error } = await supabase.from("pos_sales").insert({
                sale_number: saleNumber,
                seller_id: SELLER_ID,
                customer_name: customerName || null,
                items: posCart.map(c => ({
                    product_id: c.product_id,
                    name: c.name,
                    qty: c.qty,
                    price: c.price,
                })),
                total: posTotal,
            })
            if (error) throw error

            // Deduct stock for each item
            for (const item of posCart) {
                const product = products.find(p => p.id === item.product_id)
                if (!product) continue

                if (product.has_variants) {
                    // Deduct from first variant with stock (simplified)
                    const variant = (product.variants ?? []).find(v => v.stock > 0)
                    if (variant) {
                        await supabase
                            .from("variants")
                            .update({ stock: Math.max(0, variant.stock - item.qty) })
                            .eq("id", variant.id)
                    }
                } else {
                    await supabase
                        .from("products")
                        .update({ stock: Math.max(0, product.stock - item.qty) })
                        .eq("id", product.id)
                }
            }

            setLastSaleId(saleNumber)
            setCompleted(true)
            toast.success("Sale completed!", { description: `Sale ID: ${saleNumber} — ৳${posTotal.toLocaleString()}` })
            setPosCart([])
            setCustomerName("")
        } catch (err: any) {
            toast.error(err.message || "Failed to complete sale")
        } finally {
            setSaving(false)
        }
    }

    const newSale = () => {
        setCompleted(false)
        setLastSaleId("")
    }

    if (completed) {
        return (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle className="w-20 h-20 text-teal-500 mb-6" />
                <h2 className="text-3xl font-extrabold mb-2">Sale Completed!</h2>
                <p className="text-muted-foreground mb-2">Sale ID: <b>{lastSaleId}</b></p>
                <p className="text-muted-foreground mb-8">Stock has been automatically deducted.</p>
                <Button onClick={newSale} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12">
                    New Sale
                </Button>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Quick Sell (Mini-POS)</h1>
                <p className="text-muted-foreground mt-1">Record an offline/walk-in sale. Stock auto-deducts.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
                {/* Product Search — Left */}
                <div className="md:col-span-3 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-12 rounded-xl"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {filtered.map((p) => {
                                const stock = getStock(p)
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => addToPOS(p)}
                                        disabled={stock === 0}
                                        className="text-left p-4 rounded-2xl border bg-white dark:bg-neutral-900 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="font-semibold text-sm truncate">{p.name}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-teal-600 dark:text-teal-400">৳{p.selling_price.toLocaleString()}</span>
                                            <span className={`text-xs ${stock <= 5 ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                                {stock} left
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Cart — Right */}
                <div className="md:col-span-2">
                    <Card className="rounded-2xl shadow-lg sticky top-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShoppingCart className="h-5 w-5" /> Current Sale
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Customer name (optional)"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="rounded-xl"
                            />

                            {posCart.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-6">Tap a product to add it.</p>
                            ) : (
                                <div className="space-y-3">
                                    {posCart.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">৳{item.price} × {item.qty}</div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => removeFromPOS(item.id)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center font-bold">{item.qty}</span>
                                                <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => {
                                                    const p = products.find(pr => pr.id === item.id)
                                                    if (p) addToPOS(p)
                                                }}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            <div className="flex justify-between font-extrabold text-lg">
                                <span>Total</span>
                                <span className="text-teal-600">৳ {posTotal.toLocaleString()}</span>
                            </div>

                            <Button
                                onClick={completeSale}
                                disabled={posCart.length === 0 || saving}
                                className="w-full h-14 rounded-2xl font-bold text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                {saving ? "Processing..." : "Complete Sale"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
