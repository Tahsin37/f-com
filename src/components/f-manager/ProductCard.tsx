"use client"

import React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Product {
    id: string
    name: string
    price: number
    strikePrice?: number
    discountPercent?: number
    images: string[]
    variants: { id: string; name: string }[]
    inStock: boolean
}

interface ProductCardProps {
    product: Product
    onQuickView?: (product: Product) => void
    onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
    return (
        <Card className="group overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg border-neutral-200 dark:border-neutral-800">
            <CardHeader className="p-0 relative aspect-square bg-slate-50 dark:bg-neutral-900 border-b">
                {/* Placeholder for real Image component later */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-900">
                    {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-sm font-medium">1:1 Image</span>
                    )}
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {product.discountPercent && (
                        <Badge variant="destructive" className="font-bold shadow-sm rounded-md px-1.5 py-0.5 text-xs">
                            -{product.discountPercent}%
                        </Badge>
                    )}
                    {!product.inStock && (
                        <Badge variant="secondary" className="font-semibold shadow-sm backdrop-blur-md bg-white/80 dark:bg-black/80">
                            Out of stock
                        </Badge>
                    )}
                </div>

                {/* Quick actions overlay (desktop hover) */}
                <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center z-20">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full shadow-lg rounded-xl font-semibold backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 hover:bg-white dark:hover:bg-neutral-800 h-9"
                        onClick={(e) => {
                            e.stopPropagation()
                            onQuickView?.(product)
                        }}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Quick View
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-3 pt-4 min-h-[5rem]">
                <h3 className="font-bold text-base leading-tight line-clamp-2 mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {product.name}
                </h3>
                {product.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {product.variants.map((v) => (
                            <span key={v.id} className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400">
                                {v.name}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 pt-0 flex items-end justify-between">
                <div className="flex flex-col">
                    {product.strikePrice && (
                        <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                            ৳ {product.strikePrice.toLocaleString()}
                        </span>
                    )}
                    <span className="text-lg font-extrabold text-foreground leading-none">
                        ৳ {product.price.toLocaleString()}
                    </span>
                </div>
                <Button
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950 dark:text-teal-400 dark:hover:bg-teal-600 dark:hover:text-white transition-colors"
                    disabled={!product.inStock}
                    onClick={(e) => {
                        e.stopPropagation()
                        onAddToCart?.(product)
                    }}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
