"use client"

import React, { use, useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { StoreCartProvider, useStoreCart } from "@/lib/StoreCartContext"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Search, Loader2, SlidersHorizontal, ShoppingCart, ArrowLeft,
    Star, X, ChevronDown
} from "lucide-react"
import type { Product as DBProduct } from "@/lib/types"

function mapProduct(p: DBProduct) {
    const effectivePrice = p.discount > 0
        ? Math.round(p.selling_price * (1 - p.discount / 100))
        : p.selling_price
    const hasStock = p.has_variants
        ? (p.variants?.some(v => v.stock > 0) ?? false)
        : p.stock > 0
    return {
        id: p.id, name: p.name, price: effectivePrice,
        originalPrice: p.selling_price, discount: p.discount,
        images: p.images ?? [], inStock: hasStock,
        category: p.category, description: p.description,
    }
}

function SearchInner({ slug }: { slug: string }) {
    const [seller, setSeller] = useState<any>(null)
    const [allProducts, setAllProducts] = useState<ReturnType<typeof mapProduct>[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState("all")
    const [sortBy, setSortBy] = useState("relevant")
    const [inStockOnly, setInStockOnly] = useState(false)
    const [priceMin, setPriceMin] = useState("")
    const [priceMax, setPriceMax] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const { addItem, itemCount } = useStoreCart()
    const router = useRouter()

    useEffect(() => {
        async function load() {
            const { data: sd } = await supabase.from("sellers").select("id, name, slug, settings").eq("slug", slug).single()
            if (!sd) { setLoading(false); return }
            setSeller(sd)
            const { data: pd } = await supabase.from("products").select("*, variants(*)").eq("seller_id", sd.id).eq("is_active", true)
            if (pd) setAllProducts(pd.map(mapProduct))
            setLoading(false)
        }
        load()
    }, [slug])

    const categories = useMemo(() => ["all", ...new Set(allProducts.map(p => p.category))], [allProducts])

    const results = useMemo(() => {
        let filtered = allProducts
        if (query) {
            const q = query.toLowerCase()
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.description || "").toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            )
        }
        if (category !== "all") filtered = filtered.filter(p => p.category === category)
        if (inStockOnly) filtered = filtered.filter(p => p.inStock)
        if (priceMin) filtered = filtered.filter(p => p.price >= Number(priceMin))
        if (priceMax) filtered = filtered.filter(p => p.price <= Number(priceMax))

        // Sort
        if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price)
        else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price)
        else if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name))

        return filtered
    }, [allProducts, query, category, inStockOnly, priceMin, priceMax, sortBy])

    const themeColor = seller?.settings?.theme_color || "#0d9488"

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="h-14 flex items-center gap-3">
                        <Link href={`/store/${slug}`} className="shrink-0"><ArrowLeft className="h-5 w-5" /></Link>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                autoFocus
                                placeholder="Search products..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="pl-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-900"
                            />
                            {query && (
                                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="h-4 w-4 text-neutral-400" />
                                </button>
                            )}
                        </div>
                        <button onClick={() => router.push(`/store/${slug}/checkout`)} className="relative shrink-0">
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{itemCount}</span>}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-4">
                {/* Filter bar */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${category === cat ? "text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"}`}
                            style={category === cat ? { backgroundColor: themeColor } : {}}>
                            {cat === "all" ? "All" : cat}
                        </button>
                    ))}
                    <button onClick={() => setShowFilters(!showFilters)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1">
                        <SlidersHorizontal className="h-3 w-3" /> Filters
                    </button>
                </div>

                {/* Expanded filters */}
                {showFilters && (
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 mb-4 space-y-3 border border-neutral-200 dark:border-neutral-800">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Min Price (৳)</label>
                                <Input value={priceMin} onChange={e => setPriceMin(e.target.value)} type="number" placeholder="0" className="h-9 rounded-lg" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Max Price (৳)</label>
                                <Input value={priceMax} onChange={e => setPriceMax(e.target.value)} type="number" placeholder="99999" className="h-9 rounded-lg" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded" />
                                In Stock Only
                            </label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 bg-white dark:bg-neutral-800">
                                <option value="relevant">Most Relevant</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Results count */}
                <p className="text-xs text-muted-foreground mb-3">{results.length} product{results.length !== 1 ? "s" : ""} found</p>

                {/* Results grid */}
                {results.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="h-12 w-12 mx-auto mb-3 text-neutral-200" />
                        <p className="text-sm text-muted-foreground">No products found. Try a different search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {results.map(p => (
                            <Link key={p.id} href={`/store/${slug}/product/${p.id}`}
                                className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
                                    {p.images[0] ? (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">📦</div>
                                    )}
                                    {p.discount > 0 && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">-{Math.round(p.discount)}%</span>}
                                    {!p.inStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-xs font-bold bg-red-600 px-3 py-1 rounded-full">Sold Out</span></div>}
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-muted-foreground capitalize">{p.category}</p>
                                    <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-tight">{p.name}</h3>
                                    <div className="flex items-baseline gap-1.5 mt-1.5">
                                        <span className="text-sm font-extrabold" style={{ color: themeColor }}>৳{p.price.toLocaleString()}</span>
                                        {p.discount > 0 && <span className="text-[10px] text-muted-foreground line-through">৳{p.originalPrice.toLocaleString()}</span>}
                                    </div>
                                    {p.inStock && (
                                        <button
                                            onClick={e => { e.preventDefault(); addItem({ id: p.id, name: p.name, price: p.price, quantity: 1, image: p.images[0] }); toast.success("Added!") }}
                                            className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-bold text-white"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SearchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    return (
        <StoreCartProvider slug={slug}>
            <SearchInner slug={slug} />
        </StoreCartProvider>
    )
}
