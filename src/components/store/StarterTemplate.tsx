"use client"

import React from "react"
import { Product } from "@/components/f-manager/ProductCard"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
    Search, ShoppingCart, Truck, ShieldCheck, Heart,
    ArrowRight
} from "lucide-react"

interface StarterTemplateProps {
    storeName: string
    tagline: string
    themeColor: string
    bannerImage: string
    bannerTitle: string
    bannerSubtitle: string
    bannerCta: string
    products: Product[]
    cartCount: number
    search: string
    onSearchChange: (v: string) => void
    onAddToCart: (p: Product) => void
    onQuickView: (p: Product) => void
    onCartClick: () => void
    slug: string
}

export function StarterTemplate({
    storeName, tagline, themeColor, bannerImage, bannerTitle, bannerSubtitle,
    bannerCta, products, cartCount, search, onSearchChange,
    onAddToCart, onQuickView, onCartClick, slug
}: StarterTemplateProps) {
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0c0c] font-serif">
            {/* ── MINIMAL HEADER ── */}
            <header className="sticky top-0 z-50 bg-[#fafaf9]/95 dark:bg-[#0c0c0c]/95 backdrop-blur-lg">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link href={`/store/${slug}`} className="text-lg tracking-[0.2em] uppercase font-light">
                        {storeName}
                    </Link>
                    <button onClick={onCartClick} className="relative group">
                        <ShoppingCart className="h-5 w-5 text-neutral-500 group-hover:text-foreground transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1"
                                style={{ backgroundColor: themeColor }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="max-w-3xl mx-auto px-6">
                    <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6">
                {/* ── HERO ── */}
                <section className="py-20 md:py-28 text-center">
                    {bannerImage && (
                        <div className="mb-12 rounded-sm overflow-hidden">
                            <img src={bannerImage} alt={bannerTitle} className="w-full h-72 md:h-96 object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                        </div>
                    )}

                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                        {tagline}
                    </p>

                    <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-3 leading-tight">
                        {bannerTitle || storeName}
                    </h1>

                    <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                        {bannerSubtitle || tagline}
                    </p>

                    {!bannerImage && (
                        <div className="w-16 h-px mx-auto mb-8" style={{ backgroundColor: themeColor }} />
                    )}

                    <div className="flex items-center justify-center gap-8 text-xs text-neutral-400 tracking-wide mb-12">
                        <span className="flex items-center gap-1.5"><Truck className="h-3 w-3" /> Free Delivery</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Secure</span>
                        <span className="flex items-center gap-1.5"><Heart className="h-3 w-3" /> {products.length} Items</span>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xs mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                            className="pl-9 h-10 rounded-none border-neutral-300 dark:border-neutral-700 bg-transparent text-sm tracking-wide focus:border-neutral-500"
                        />
                    </div>
                </section>

                {/* ── PRODUCTS ── */}
                <section className="pb-24">
                    {search && (
                        <p className="text-xs text-neutral-400 tracking-wide mb-6 uppercase">
                            {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
                        </p>
                    )}

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-neutral-400 text-sm tracking-wide">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            {filteredProducts.map(p => {
                                const hasDiscount = (p.discountPercent ?? 0) > 0
                                return (
                                    <div key={p.id} className="group cursor-pointer" onClick={() => onQuickView(p)}>
                                        {/* Image */}
                                        <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 mb-4 overflow-hidden relative">
                                            {p.images?.[0] ? (
                                                <img
                                                    src={p.images[0]}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-4xl text-neutral-300">✦</span>
                                                </div>
                                            )}

                                            {!p.inStock && (
                                                <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
                                                    <span className="text-xs tracking-[0.2em] uppercase text-neutral-500">Sold Out</span>
                                                </div>
                                            )}

                                            {/* Add to Cart — slides up on hover */}
                                            {p.inStock && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onAddToCart(p) }}
                                                    className="absolute bottom-0 left-0 right-0 py-3 text-xs tracking-[0.15em] uppercase font-medium text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                                                    style={{ backgroundColor: themeColor }}
                                                >
                                                    Add to Cart
                                                </button>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 mb-1">
                                            {p.category}
                                        </p>
                                        <h3 className="text-sm font-medium mb-1.5 tracking-wide">
                                            {p.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold" style={{ color: themeColor }}>
                                                ৳{p.price.toLocaleString()}
                                            </span>
                                            {hasDiscount && p.strikePrice && (
                                                <span className="text-xs text-neutral-400 line-through">
                                                    ৳{p.strikePrice.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* ── MINIMAL FOOTER ── */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-3xl mx-auto px-6 py-12 text-center">
                    <p className="text-lg tracking-[0.2em] uppercase font-light mb-2">{storeName}</p>
                    <p className="text-xs text-neutral-400 tracking-wide mb-8">{tagline}</p>

                    <div className="flex justify-center gap-8 text-xs text-neutral-400 tracking-wide mb-8">
                        <Link href={`/store/${slug}`} className="hover:text-foreground transition-colors">Home</Link>
                        <button onClick={onCartClick} className="hover:text-foreground transition-colors">Cart</button>
                    </div>

                    <div className="h-px w-8 bg-neutral-200 dark:bg-neutral-800 mx-auto mb-6" />
                    <p className="text-[10px] text-neutral-300 dark:text-neutral-700 tracking-wider">
                        Powered by F-Manager
                    </p>
                </div>
            </footer>
        </div>
    )
}
