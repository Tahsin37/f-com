"use client"

import React, { use, useState, useEffect } from "react"
import { ProductCard } from "@/components/f-manager/ProductCard"
import { ProductDrawer } from "@/components/f-manager/ProductDrawer"
import { StickyCartBar } from "@/components/f-manager/StickyCartBar"
import { useCart } from "@/lib/CartContext"
import { Header } from "@/components/f-manager/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Search, Loader2, ShoppingBag, Sparkles, Truck, ShieldCheck, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Product as DBProduct } from "@/lib/types"

// Map DB product to the legacy Product interface used by ProductCard
function mapProduct(p: DBProduct) {
    const effectivePrice = p.discount > 0
        ? Math.round(p.selling_price * (1 - p.discount / 100))
        : p.selling_price

    const hasStock = p.has_variants
        ? (p.variants?.some(v => v.stock > 0) ?? false)
        : p.stock > 0

    return {
        id: p.id,
        name: p.name,
        price: effectivePrice,
        strikePrice: p.discount > 0 ? p.selling_price : undefined,
        discountPercent: p.discount > 0 ? p.discount : undefined,
        images: p.images ?? [],
        variants: (p.variants ?? []).map(v => ({ id: v.id, name: v.label })),
        inStock: hasStock,
        category: p.category,
        metadata: p.metadata,
        description: p.description,
    }
}

const CATEGORY_PILLS = [
    { key: "all", label: "All", emoji: "🛍️" },
    { key: "fashion", label: "Fashion", emoji: "👗" },
    { key: "books", label: "Books", emoji: "📚" },
    { key: "electronics", label: "Gadgets", emoji: "📱" },
    { key: "grocery", label: "Food", emoji: "🍎" },
    { key: "others", label: "Others", emoji: "📦" },
]

export default function DemoStorefront({ params }: { params: Promise<{ seller: string }> }) {
    const { seller } = use(params)
    const { cart, addToCart } = useCart()
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [drawerProduct, setDrawerProduct] = useState<ReturnType<typeof mapProduct> | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [products, setProducts] = useState<ReturnType<typeof mapProduct>[]>([])
    const [rawCategories, setRawCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [storeName, setStoreName] = useState("")

    useEffect(() => {
        async function load() {
            // Get seller by slug
            const { data: sellerData } = await supabase
                .from("sellers")
                .select("id, name")
                .eq("slug", seller)
                .single()

            if (!sellerData) {
                setLoading(false)
                return
            }

            setStoreName(sellerData.name)

            // Fetch products with variants
            const { data: productsData } = await supabase
                .from("products")
                .select("*, variants(*)")
                .eq("seller_id", sellerData.id)
                .eq("is_active", true)
                .order("created_at", { ascending: false })

            if (productsData) {
                setProducts(productsData.map(mapProduct))
                setRawCategories([...new Set(productsData.map((p: any) => p.category as string))])
            }
            setLoading(false)
        }
        load()
    }, [seller])

    const handleAddToCart = (product: any) => {
        addToCart(product)
        toast.success(`${product.name} added to cart!`, {
            action: {
                label: "View Cart",
                onClick: () => router.push("/checkout"),
            },
        })
    }

    const handleQuickView = (product: any) => {
        setDrawerProduct(product)
        setDrawerOpen(true)
    }

    const filteredProducts = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
        const matchCategory = category === "all" || (p as any).category === category
        return matchSearch && matchCategory
    })

    const activeCategories = rawCategories

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-950 dark:to-black">
            <Header />

            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 left-8 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl" />
                </div>
                <div className="container px-4 py-10 md:py-16 relative z-10">
                    <div className="max-w-xl">
                        <Badge className="bg-white/20 text-white border-white/20 text-xs mb-4 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3 mr-1" /> New Collection
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 leading-tight">
                            {storeName || "Store"}
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base mb-6 max-w-md">
                            Best quality products with fast delivery across Bangladesh. Shop with confidence! 🇧🇩
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                                <Truck className="h-3.5 w-3.5" /> Fast Delivery
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                                <ShieldCheck className="h-3.5 w-3.5" /> OTP Verified
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                                <ShoppingBag className="h-3.5 w-3.5" /> {products.length} Products
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container px-4 py-6 md:py-10">
                {/* Search Bar */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-2xl text-sm border-neutral-200 dark:border-neutral-800 shadow-sm"
                    />
                </div>

                {/* Category Pills — horizontal scroll */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                    {CATEGORY_PILLS.filter(c => c.key === "all" || activeCategories.includes(c.key)).map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setCategory(cat.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${category === cat.key
                                ? "bg-teal-600 text-white shadow-md shadow-teal-500/30"
                                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-foreground hover:border-teal-300"
                                }`}
                        >
                            <span>{cat.emoji}</span> {cat.label}
                        </button>
                    ))}
                </div>

                {/* Product Count */}
                <div className="flex items-center justify-between mb-4 mt-2">
                    <p className="text-sm text-muted-foreground font-medium">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                        <p className="text-muted-foreground font-medium">
                            {search ? "No products match your search" : "No products in this category"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product as any}
                                onAddToCart={handleAddToCart as any}
                                onQuickView={handleQuickView as any}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Product Drawer */}
            <ProductDrawer
                product={drawerProduct as any}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />

            {/* Sticky Cart Bar */}
            <StickyCartBar items={cart} onOrderNow={() => router.push("/checkout")} />
        </div>
    )
}
