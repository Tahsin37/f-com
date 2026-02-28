"use client"

import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Product } from "./ProductCard"
import { useCart } from "@/lib/CartContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react"

interface ProductDrawerProps {
    product: Product | null
    open: boolean
    onClose: () => void
}

export function ProductDrawer({ product, open, onClose }: ProductDrawerProps) {
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [imageIndex, setImageIndex] = useState(0)
    const { addToCart } = useCart()
    const router = useRouter()

    if (!product) return null

    const handleAddToCart = () => {
        addToCart(product, quantity)
        toast.success(`${product.name} added to cart`, {
            description: `${quantity}x — ৳${(product.price * quantity).toLocaleString()}`
        })
        onClose()
        setQuantity(1)
        setSelectedVariant(null)
    }

    const handleOrderNow = () => {
        addToCart(product, quantity)
        onClose()
        router.push("/checkout")
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-t-3xl p-0 overflow-auto border-0">
                <div className="flex flex-col h-full">
                    {/* Image Section */}
                    <div className="relative aspect-square sm:aspect-[4/3] max-h-[50vh] bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                        {product.images[0] ? (
                            <img
                                src={product.images[imageIndex] || product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image
                            </div>
                        )}

                        {/* Image dots */}
                        {product.images.length > 1 && (
                            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                                {product.images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImageIndex(i)}
                                        className={`h-2 rounded-full transition-all ${i === imageIndex ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Discount badge */}
                        {product.discountPercent && (
                            <Badge variant="destructive" className="absolute top-4 left-4 text-sm font-bold px-2.5 py-1 rounded-lg shadow-lg">
                                -{product.discountPercent}%
                            </Badge>
                        )}

                        {!product.inStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white font-bold text-xl bg-black/60 px-6 py-2 rounded-full">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="p-6 flex-1 space-y-5">
                        <SheetHeader className="text-left p-0">
                            <SheetTitle className="text-xl font-extrabold leading-tight pr-8">
                                {product.name}
                            </SheetTitle>
                        </SheetHeader>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                                ৳ {product.price.toLocaleString()}
                            </span>
                            {product.strikePrice && (
                                <span className="text-lg text-muted-foreground line-through">
                                    ৳ {product.strikePrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Variant Selector */}
                        {product.variants.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Select Variant
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v.id)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${selectedVariant === v.id
                                                    ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 shadow-sm"
                                                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                                }`}
                                        >
                                            {v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground ml-2">
                                    Subtotal: <span className="font-bold text-foreground">৳ {(product.price * quantity).toLocaleString()}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom CTAs */}
                    <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t p-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <Button
                            onClick={handleAddToCart}
                            variant="outline"
                            size="lg"
                            disabled={!product.inStock}
                            className="flex-1 rounded-2xl h-14 font-bold text-base active:scale-95 transition-all"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Add to Cart
                        </Button>
                        <Button
                            onClick={handleOrderNow}
                            size="lg"
                            disabled={!product.inStock}
                            className="flex-1 rounded-2xl h-14 font-bold text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
                        >
                            <Zap className="w-5 h-5 mr-2" />
                            Order Now
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
