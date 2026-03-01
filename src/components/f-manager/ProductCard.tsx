"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Star } from "lucide-react"

export interface Product {
    id: string
    name: string
    price: number
    strikePrice?: number
    discountPercent?: number
    images: string[]
    variants: { id: string; name: string }[]
    inStock: boolean
    category?: string
    description?: string
    metadata?: Record<string, any>
}

interface ProductCardProps {
    product: Product
    onQuickView?: (product: Product) => void
    onAddToCart?: (product: Product) => void
}

// Static rating between 4.0 and 5.0 seeded by product id
function pseudoRating(id: string) {
    const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
    return (4.0 + (n % 10) / 10).toFixed(1)
}

function StarRating({ rating }: { rating: string }) {
    const r = parseFloat(rating)
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-2.5 w-2.5 ${i <= Math.round(r) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"}`}
                />
            ))}
            <span className="text-[10px] text-muted-foreground ml-0.5 font-medium">{rating}</span>
        </div>
    )
}

export function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
    const [imgError, setImgError] = useState(false)
    const rating = pseudoRating(product.id)

    return (
        <div
            className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => onQuickView?.(product)}
        >
            {/* Image container */}
            <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                {product.images[0] && !imgError ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                        🛍️
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {product.discountPercent && product.discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md leading-none">
                            -{product.discountPercent}%
                        </span>
                    )}
                    {!product.inStock && (
                        <span className="bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm leading-none">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Hover overlay — quick view */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <button
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                    onClick={(e) => { e.stopPropagation(); onQuickView?.(product) }}
                >
                    <Eye className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                </button>

                {/* Add to Cart — slides up from bottom on hover */}
                {product.inStock && (
                    <button
                        className="absolute bottom-0 inset-x-0 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10"
                        onClick={(e) => { e.stopPropagation(); onAddToCart?.(product) }}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">{product.category || "General"}</p>
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground mb-1.5 min-h-[2.5rem]">
                    {product.name}
                </h3>

                <StarRating rating={rating} />

                <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-teal-700 dark:text-teal-400">
                        ৳{product.price.toLocaleString()}
                    </span>
                    {product.strikePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                            ৳{product.strikePrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {product.variants.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                    </p>
                )}
            </div>
        </div>
    )
}
