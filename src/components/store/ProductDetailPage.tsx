"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    ChevronLeft, ChevronRight, ShoppingCart, Zap, Truck,
    ShieldCheck, Heart, Share2, Minus, Plus, Star, ArrowLeft
} from "lucide-react"

interface Variant {
    id: string
    label: string
    stock: number
    price_override?: number
}

interface PDPProduct {
    id: string
    name: string
    category: string
    description?: string
    selling_price: number
    discount: number
    images: string[]
    metadata: Record<string, unknown>
    has_variants: boolean
    stock: number
    variants: Variant[]
}

interface ProductDetailPageProps {
    product: PDPProduct
    slug: string
    themeColor: string
    storeName: string
    onAddToCart: (item: {
        id: string; name: string; price: number; quantity: number;
        variant_id?: string; variant_label?: string; image?: string
    }) => void
    onOrderNow: (item: {
        id: string; name: string; price: number; quantity: number;
        variant_id?: string; variant_label?: string; image?: string
    }) => void
    relatedProducts?: Array<{ id: string; name: string; price: number; image?: string; slug: string }>
}

export function ProductDetailPage({
    product, slug, themeColor, storeName, onAddToCart, onOrderNow, relatedProducts = []
}: ProductDetailPageProps) {

    const [currentImage, setCurrentImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [touchStart, setTouchStart] = useState(0)
    const galleryRef = useRef<HTMLDivElement>(null)

    const images = product.images.length > 0 ? product.images : [""]
    const effectivePrice = product.discount > 0
        ? Math.round(product.selling_price * (1 - product.discount / 100))
        : product.selling_price

    // Variant logic
    const selectedVariantData = product.variants.find(v => v.id === selectedVariant)
    const finalPrice = selectedVariantData?.price_override ?? effectivePrice
    const currentStock = product.has_variants
        ? (selectedVariantData?.stock ?? 0)
        : product.stock
    const isOutOfStock = currentStock <= 0
    const lowStock = currentStock > 0 && currentStock <= 5

    // Auto-select first in-stock variant
    React.useEffect(() => {
        if (product.has_variants && product.variants.length > 0 && !selectedVariant) {
            const firstAvailable = product.variants.find(v => v.stock > 0)
            if (firstAvailable) setSelectedVariant(firstAvailable.id)
        }
    }, [product, selectedVariant])

    // Dynamic metadata display
    const metadataEntries = Object.entries(product.metadata || {}).filter(([, v]) => v != null && v !== "")

    const handleAddToCart = () => {
        onAddToCart({
            id: product.id,
            name: product.name,
            price: finalPrice,
            quantity,
            variant_id: selectedVariant || undefined,
            variant_label: selectedVariantData?.label,
            image: images[0],
        })
    }

    // Swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStart - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentImage < images.length - 1) setCurrentImage(currentImage + 1)
            if (diff < 0 && currentImage > 0) setCurrentImage(currentImage - 1)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24">
            {/* Top bar */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-3">
                    <Link href={`/store/${slug}`} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft className="h-4 w-4" /> {storeName}
                    </Link>
                    <div className="flex-1" />
                    <button className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><Heart className="h-4 w-4" /></button>
                    <button className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><Share2 className="h-4 w-4" /></button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8 md:gap-12 lg:gap-16 mt-6 md:mt-8">
                    {/* ── Image Gallery ── */}
                    <div className="space-y-4">
                        <div
                            ref={galleryRef}
                            className="relative aspect-square md:aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {images[currentImage] ? (
                                <img
                                    src={images[currentImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl text-neutral-300">📦</div>
                            )}

                            {/* Discount badge */}
                            {product.discount > 0 && (
                                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500">
                                    -{Math.round(product.discount)}%
                                </span>
                            )}

                            {/* Nav arrows */}
                            {images.length > 1 && (
                                <>
                                    {currentImage > 0 && (
                                        <button onClick={() => setCurrentImage(currentImage - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                    )}
                                    {currentImage < images.length - 1 && (
                                        <button onClick={() => setCurrentImage(currentImage + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </>
                            )}

                            {/* Dots */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <button key={i} onClick={() => setCurrentImage(i)}
                                            className={`h-2 rounded-full transition-all ${i === currentImage ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setCurrentImage(i)}
                                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentImage ? "border-current" : "border-transparent opacity-60"}`}
                                        style={i === currentImage ? { borderColor: themeColor } : {}}>
                                        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Product Info ── */}
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
                            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />)}</div>
                                <span className="text-sm text-muted-foreground">(Customer Reviews)</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-extrabold" style={{ color: themeColor }}>৳{finalPrice.toLocaleString()}</span>
                            {product.discount > 0 && (
                                <span className="text-lg text-muted-foreground line-through">৳{product.selling_price.toLocaleString()}</span>
                            )}
                            {product.discount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold">
                                    Save {Math.round(product.discount)}%
                                </span>
                            )}
                        </div>

                        {/* Stock status */}
                        <div>
                            {isOutOfStock ? (
                                <span className="text-sm font-bold text-red-500">❌ Out of Stock</span>
                            ) : lowStock ? (
                                <span className="text-sm font-bold text-amber-500">⚡ Only {currentStock} left — order soon!</span>
                            ) : (
                                <span className="text-sm font-medium text-green-600">✅ In Stock</span>
                            )}
                        </div>

                        {/* Dynamic metadata */}
                        {metadataEntries.length > 0 && (
                            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                {metadataEntries.map(([key, val]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                                        <span className="font-semibold">{String(val)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Variant selector */}
                        {product.has_variants && product.variants.length > 0 && (
                            <div>
                                <p className="text-sm font-bold mb-2">Select Variant</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map(v => {
                                        const oos = v.stock <= 0
                                        const selected = selectedVariant === v.id
                                        return (
                                            <button
                                                key={v.id}
                                                disabled={oos}
                                                onClick={() => !oos && setSelectedVariant(v.id)}
                                                className={`min-w-[44px] min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${oos ? "opacity-30 line-through cursor-not-allowed border-neutral-200 dark:border-neutral-700" :
                                                    selected ? "text-white shadow-md" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                                                    }`}
                                                style={selected && !oos ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                                            >
                                                {v.label}
                                                {oos && " ✕"}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <p className="text-sm font-bold mb-2">Quantity</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                    className="h-10 w-10 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                                <button onClick={() => quantity < currentStock && setQuantity(quantity + 1)}
                                    className="h-10 w-10 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex gap-3 pt-2">
                            <Button
                                disabled={isOutOfStock}
                                onClick={handleAddToCart}
                                variant="outline"
                                className="flex-1 h-12 rounded-xl text-sm font-bold gap-2"
                            >
                                <ShoppingCart className="h-4 w-4" /> Add to Cart
                            </Button>
                            <Button
                                disabled={isOutOfStock}
                                onClick={() => {
                                    onOrderNow({
                                        id: product.id, name: product.name, price: finalPrice, quantity,
                                        variant_id: selectedVariant || undefined,
                                        variant_label: selectedVariantData?.label,
                                        image: images[0] || undefined,
                                    })
                                }}
                                className="flex-1 h-12 rounded-xl text-sm font-bold text-white gap-2"
                                style={{ backgroundColor: themeColor }}
                            >
                                <Zap className="h-4 w-4" /> Order Now
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fast Delivery</span>
                            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure Payment</span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-sm font-bold mb-2">Description</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── STICKY MOBILE BOTTOM CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-neutral-800 p-3 flex gap-2 md:hidden safe-area-bottom">
                <Button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl text-sm font-bold gap-1.5"
                >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
                <Button
                    disabled={isOutOfStock}
                    onClick={() => {
                        onOrderNow({
                            id: product.id, name: product.name, price: finalPrice, quantity,
                            variant_id: selectedVariant || undefined,
                            variant_label: selectedVariantData?.label,
                            image: images[0] || undefined,
                        })
                    }}
                    className="flex-1 h-12 rounded-xl text-sm font-bold text-white gap-1.5"
                    style={{ backgroundColor: themeColor }}
                >
                    <Zap className="h-4 w-4" /> Order Now — ৳{(finalPrice * quantity).toLocaleString()}
                </Button>
            </div>
        </div>
    )
}
