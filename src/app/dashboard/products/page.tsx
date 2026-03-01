"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { Plus, Search, Pencil, Trash2, Package, Loader2, Eye, EyeOff } from "lucide-react"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [sellerId, setSellerId] = useState<string>("")

    async function loadProducts() {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) { setLoading(false); return }

        const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", userId).single()
        if (!seller) { setLoading(false); return }
        setSellerId(seller.id)

        const { data, error } = await supabase
            .from("products")
            .select("*, variants(*)")
            .eq("seller_id", seller.id)
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to load products")
        } else {
            setProducts(data ?? [])
        }
        setLoading(false)
    }

    useEffect(() => { loadProducts() }, [])

    const toggleActive = async (product: Product) => {
        const { error } = await supabase
            .from("products")
            .update({ is_active: !product.is_active })
            .eq("id", product.id)
        if (error) {
            toast.error("Failed to update product")
        } else {
            toast.success(product.is_active ? "Product hidden" : "Product visible")
            loadProducts()
        }
    }

    const deleteProduct = async (id: string) => {
        if (!confirm("Delete this product? This cannot be undone.")) return
        const { error } = await supabase.from("products").delete().eq("id", id)
        if (error) {
            toast.error("Failed to delete product")
        } else {
            toast.success("Product deleted")
            loadProducts()
        }
    }

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    const totalStock = products.reduce((sum, p) => {
        if (p.has_variants && p.variants) {
            return sum + p.variants.reduce((s, v) => s + v.stock, 0)
        }
        return sum + p.stock
    }, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Products</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {products.length} products · {totalStock} total stock
                    </p>
                </div>
                <Link href="/dashboard/products/add">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products by name or category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                />
            </div>

            {/* Product List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">{search ? "No products match your search" : "No products yet"}</p>
                    {!search && (
                        <Link href="/dashboard/products/add">
                            <Button variant="outline" className="mt-4 rounded-xl">Add your first product</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(p => {
                        const stock = p.has_variants
                            ? (p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0)
                            : p.stock
                        return (
                            <Card key={p.id} className={`border ${!p.is_active ? 'opacity-60' : ''}`}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                                        {p.images?.[0] ? (
                                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-sm truncate">{p.name}</h3>
                                            <Badge variant="secondary" className="text-[10px] uppercase shrink-0">{p.category}</Badge>
                                            {!p.is_active && <Badge variant="outline" className="text-[10px] shrink-0">Hidden</Badge>}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="font-bold text-foreground">৳{p.selling_price.toLocaleString()}</span>
                                            {p.discount > 0 && <span className="text-green-600 text-xs font-semibold">-{p.discount}%</span>}
                                            <span className={stock <= 5 ? "text-red-500 font-bold" : ""}>
                                                {stock} in stock
                                            </span>
                                            {p.has_variants && <span>{p.variants?.length ?? 0} variants</span>}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(p)}
                                            title={p.is_active ? "Hide product" : "Show product"}>
                                            {p.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                        <Link href={`/dashboard/products/add?edit=${p.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteProduct(p.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
