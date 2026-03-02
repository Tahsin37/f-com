"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search, ShoppingCart, ChevronRight, ChevronLeft, Star, Truck,
    ShieldCheck, Award, Zap, Heart, ChevronDown, ChevronUp,
    Mail, ArrowRight, Facebook, Instagram, Phone, MapPin, Menu, X, Filter, SlidersHorizontal
} from "lucide-react"

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface StoreProduct {
    id: string
    name: string
    price: number
    strikePrice?: number
    discountPercent?: number
    images: string[]
    variants: { id: string; name: string }[]
    inStock: boolean
    category: string
    metadata?: Record<string, unknown>
    description?: string
    rating?: number
}

interface StoreTemplateProps {
    storeName: string
    tagline: string
    themeColor: string
    bannerImage: string
    bannerTitle: string
    bannerSubtitle: string
    bannerCta: string
    campaigns?: any[]
    products: StoreProduct[]
    rawCategories?: string[]
    cartCount: number
    search: string
    onSearchChange: (v: string) => void
    onAddToCart: (p: StoreProduct) => void
    onQuickView: (p: StoreProduct) => void
    onCartClick: () => void
    slug: string
    settings?: Record<string, any>
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function StoreTemplate({
    storeName, tagline, themeColor, bannerImage, bannerTitle, bannerSubtitle,
    bannerCta, campaigns, products, rawCategories = [], cartCount, search, onSearchChange,
    onAddToCart, onQuickView, onCartClick, slug, settings = {}
}: StoreTemplateProps) {

    const effectiveProducts = settings.hide_out_of_stock ? products.filter(p => p.inStock) : products

    const [selectedCategory, setSelectedCategory] = useState("all")
    const [sortBy, setSortBy] = useState("newest")
    const [heroSlide, setHeroSlide] = useState(0)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [nlEmail, setNlEmail] = useState("")
    const heroRef = useRef<HTMLDivElement>(null)

    // Filters
    const [showFilters, setShowFilters] = useState(false)
    const [minPrice, setMinPrice] = useState<string>("")
    const [maxPrice, setMaxPrice] = useState<string>("")
    const [inStockOnly, setInStockOnly] = useState(false)

    // Categories
    const categories = ["all", ...rawCategories]

    // Filter & sort
    const filtered = effectiveProducts
        .filter(p => selectedCategory === "all" || p.category === selectedCategory)
        .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
        .filter(p => {
            if (minPrice && p.price < Number(minPrice)) return false;
            if (maxPrice && p.price > Number(maxPrice)) return false;
            if (inStockOnly && !p.inStock) return false;
            return true;
        })

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price
        if (sortBy === "price_desc") return b.price - a.price
        if (sortBy === "name") return a.name.localeCompare(b.name)
        return 0 // newest = default order
    })

    // Deals = products with discount
    const deals = effectiveProducts.filter(p => (p.discountPercent ?? 0) > 0).slice(0, 6)

    // Hero slides (use banner + any campaign banners from settings)
    const heroSlides = [
        { image: bannerImage, title: bannerTitle, subtitle: bannerSubtitle, cta: bannerCta },
        ...(campaigns || []).map(c => ({
            image: c.banner_image || bannerImage,
            title: c.name,
            subtitle: c.description || "Special Campaign Offer",
            cta: "View Campaign",
            link: `?campaign=${c.id}`
        })),
        ...(settings.hero_slides || []),
    ].filter(s => s.image || s.title || s.subtitle)

    // Auto-advance hero
    useEffect(() => {
        if (heroSlides.length <= 1) return
        const timer = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 5000)
        return () => clearInterval(timer)
    }, [heroSlides.length])

    // Testimonials & FAQ from settings
    const testimonials: Array<{ name: string; text: string; rating: number }> = settings.testimonials || [
        { name: "Sabrina R.", text: "Amazing quality! Delivery was super fast. Will order again ❤️", rating: 5 },
        { name: "Rafiq H.", text: "Best price and genuine products. Highly recommended!", rating: 5 },
        { name: "Nusrat F.", text: "Customer service is excellent. Love the packaging!", rating: 4 },
    ]

    const faqItems: Array<{ q: string; a: string }> = settings.faq || [
        { q: "How long does delivery take?", a: "Inside Dhaka: 1-2 days. Outside Dhaka: 2-4 days." },
        { q: "What payment methods do you accept?", a: "Cash on Delivery (COD), bKash, and Nagad." },
        { q: "Can I return a product?", a: "Yes, within 3 days of delivery if the product is unused and in original packaging." },
        { q: "Is there a minimum order amount?", a: "No minimum order. Free delivery on orders above ৳999." },
    ]

    // Announcement bar
    const announcement = settings.announcement_bar

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100">

            {/* ═══ ANNOUNCEMENT BAR ═══ */}
            {announcement?.enabled && (
                <div className="text-center py-2 px-4 text-xs font-medium" style={{ backgroundColor: announcement.bg_color || themeColor, color: announcement.text_color || '#fff' }}>
                    {announcement.text}
                </div>
            )}

            {/* ═══ HEADER ═══ */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="h-14 md:h-16 flex items-center gap-4">
                        {/* Mobile menu toggle */}
                        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>

                        {/* Logo */}
                        <Link href={`/store/${slug}`} className="flex items-center gap-2 shrink-0">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: themeColor }}>
                                {storeName[0]?.toUpperCase()}
                            </div>
                            <span className="font-extrabold text-lg hidden sm:inline" style={{ color: themeColor }}>{storeName}</span>
                        </Link>

                        {/* Search */}
                        <div className="flex-1 max-w-lg mx-auto relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder={`Search in ${storeName}...`}
                                value={search}
                                onChange={e => onSearchChange(e.target.value)}
                                className="pl-10 h-10 rounded-full border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                            />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Track Order */}
                            <Link href={`/store/${slug}/track`} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                                <Truck className="h-4 w-4" />
                                Track Order
                            </Link>

                            {/* Cart */}
                            <button onClick={onCartClick} className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white" style={{ backgroundColor: themeColor }}>
                                <ShoppingCart className="h-4 w-4" />
                                <span className="hidden sm:inline">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile search */}
                    <div className="md:hidden pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={e => onSearchChange(e.target.value)}
                                className="pl-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Category Nav Bar */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-hide">
                    <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? "text-white shadow-sm"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    }`}
                                style={selectedCategory === cat ? { backgroundColor: themeColor } : {}}
                            >
                                {cat === "all" ? "🔥 All" : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white dark:bg-[#0a0a0a] p-6 md:hidden overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <span className="font-extrabold text-xl" style={{ color: themeColor }}>{storeName}</span>
                        <button onClick={() => setMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
                    </div>
                    <nav className="space-y-4">
                        <Link href={`/store/${slug}`} className="block text-lg font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link href={`/store/${slug}/search`} className="block text-lg font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Search</Link>
                        <Link href={`/store/${slug}/track`} className="block text-lg font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Track Order</Link>
                        {categories.filter(c => c !== "all").map(cat => (
                            <button key={cat} className="block text-lg py-2 border-b w-full text-left capitalize" onClick={() => { setSelectedCategory(cat); setMobileMenuOpen(false) }}>
                                {cat}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Filter Slider Over */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white dark:bg-[#0a0a0a] h-full shadow-2xl flex flex-col pt-4 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-xl font-extrabold flex items-center gap-2"><SlidersHorizontal className="h-5 w-5" /> Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                            {/* Price Range */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm">Price Range (৳)</h4>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                        className="h-11 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                        className="h-11 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm">Availability</h4>
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                                    <input
                                        type="checkbox"
                                        checked={inStockOnly}
                                        onChange={e => setInStockOnly(e.target.checked)}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium select-none">In Stock Only</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-3 bg-neutral-50 dark:bg-neutral-900/30">
                            <Button
                                variant="outline"
                                onClick={() => { setMinPrice(""); setMaxPrice(""); setInStockOnly(false); }}
                                className="h-12 rounded-xl"
                            >
                                Clear All
                            </Button>
                            <Button
                                onClick={() => setShowFilters(false)}
                                className="h-12 rounded-xl text-white font-bold"
                                style={{ backgroundColor: themeColor }}
                            >
                                Show {sorted.length} results
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto">

                {/* ═══ HERO BANNER SLIDER ═══ */}
                {heroSlides.length > 0 && (
                    <section className="relative mx-4 mt-4 rounded-2xl overflow-hidden" ref={heroRef}>
                        {heroSlides.map((slide, i) => (
                            <div key={i} className={`transition-opacity duration-700 ${i === heroSlide ? "opacity-100" : "opacity-0 absolute inset-0"}`}>
                                <div
                                    className="relative h-48 sm:h-64 md:h-80 lg:h-96 flex flex-col justify-end p-6 md:p-10 bg-cover bg-center"
                                    style={{
                                        backgroundImage: slide.image
                                            ? `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url('${slide.image}')`
                                            : `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                                    }}
                                >
                                    <div className="relative z-10 max-w-lg">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white mb-3">
                                            <Zap className="h-3 w-3" /> New Collection
                                        </span>
                                        <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">{slide.title}</h2>
                                        <p className="text-white/80 text-sm md:text-base mb-4">{slide.subtitle}</p>
                                        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-xl" style={{ backgroundColor: themeColor }}>
                                            {slide.cta || "Shop Now"} <ChevronRight className="h-4 w-4" />
                                        </button>
                                        <div className="flex items-center gap-4 mt-4 text-white/70 text-xs">
                                            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Delivery</span>
                                            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> OTP Secure</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Slider dots */}
                        {heroSlides.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                {heroSlides.map((_, i) => (
                                    <button key={i} onClick={() => setHeroSlide(i)}
                                        className={`h-2 rounded-full transition-all ${i === heroSlide ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
                                ))}
                            </div>
                        )}

                        {/* Nav arrows */}
                        {heroSlides.length > 1 && (
                            <>
                                <button onClick={() => setHeroSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center z-20 hover:bg-black/50 transition hidden md:flex">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button onClick={() => setHeroSlide(s => (s + 1) % heroSlides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center z-20 hover:bg-black/50 transition hidden md:flex">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </section>
                )}

                {/* ═══ TRUST BADGES ═══ */}
                <section className="grid grid-cols-3 gap-3 px-4 mt-6">
                    {[
                        { icon: Truck, label: "Fast Delivery", sub: "2-4 days" },
                        { icon: ShieldCheck, label: "OTP Verified", sub: "Secure orders" },
                        { icon: Award, label: "Top Rated", sub: `${products.length}+ items` },
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                            <badge.icon className="h-5 w-5 shrink-0" style={{ color: themeColor }} />
                            <div>
                                <p className="text-xs font-bold">{badge.label}</p>
                                <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ═══ FLASH DEALS ═══ */}
                {deals.length > 0 && (
                    <section className="px-4 mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <h2 className="text-lg font-extrabold">Flash Deals</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">HOT</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                            {deals.map(p => (
                                <div key={p.id} className="shrink-0 w-40 sm:w-48 group cursor-pointer" onClick={() => onQuickView(p)}>
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                        {p.images[0] ? (
                                            <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">📦</div>
                                        )}
                                        {(p.discountPercent ?? 0) > 0 && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">-{p.discountPercent}%</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-[10px] text-muted-foreground capitalize">{p.category}</p>
                                        <p className="text-sm font-semibold line-clamp-2 leading-tight">{p.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${s <= (p.rating ?? 4) ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`} />)}</div>
                                            <span className="text-[10px] text-muted-foreground">{(p.rating ?? 4).toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1.5 mt-1">
                                            <span className="text-sm font-extrabold" style={{ color: themeColor }}>৳{p.price.toLocaleString()}</span>
                                            {p.strikePrice && <span className="text-xs text-muted-foreground line-through">৳{p.strikePrice.toLocaleString()}</span>}
                                        </div>
                                        {p.variants.length > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{p.variants.length} variants</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══ ALL PRODUCTS ═══ */}
                <section className="px-4 mt-8 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-extrabold flex-1">
                            {search ? `Results for "${search}"` : selectedCategory !== "all" ? `${selectedCategory}` : "All Products"}
                        </h2>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowFilters(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Filter</span>
                                {(minPrice || maxPrice || inStockOnly) && (
                                    <span className="h-2 w-2 rounded-full bg-red-500 ml-1" />
                                )}
                            </button>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="text-xs border rounded-lg px-3 py-1.5 bg-white dark:bg-neutral-900 font-medium border-neutral-200 dark:border-neutral-800"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground text-sm">No products found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                            {sorted.map(p => (
                                <div key={p.id} className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow" onClick={() => onQuickView(p)}>
                                    <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
                                        {p.images[0] ? (
                                            <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">📦</div>
                                        )}
                                        {(p.discountPercent ?? 0) > 0 && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">-{p.discountPercent}%</span>
                                        )}
                                        {!p.inStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold bg-red-600 px-3 py-1 rounded-full">Sold Out</span>
                                            </div>
                                        )}
                                        {/* Quick add */}
                                        {p.inStock && (
                                            <button
                                                onClick={e => { e.stopPropagation(); onAddToCart(p) }}
                                                className="absolute bottom-2 right-2 h-8 w-8 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                <ShoppingCart className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[10px] text-muted-foreground capitalize mb-0.5">{p.category}</p>
                                        <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-tight min-h-[2em]">{p.name}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-2.5 w-2.5 ${s <= (p.rating ?? 4) ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`} />)}
                                        </div>
                                        <div className="flex items-baseline gap-1.5 mt-1.5">
                                            <span className="text-sm font-extrabold" style={{ color: themeColor }}>৳{p.price.toLocaleString()}</span>
                                            {p.strikePrice && <span className="text-[10px] text-muted-foreground line-through">৳{p.strikePrice.toLocaleString()}</span>}
                                        </div>
                                        {p.variants.length > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{p.variants.length} variants</p>}

                                        {/* Mobile add-to-cart */}
                                        {p.inStock && (
                                            <button
                                                onClick={e => { e.stopPropagation(); onAddToCart(p) }}
                                                className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-bold text-white md:hidden"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ═══ TESTIMONIALS ═══ */}
                {testimonials.length > 0 && (
                    <section className="px-4 py-10 mt-4 bg-neutral-50 dark:bg-neutral-900/50">
                        <h2 className="text-lg font-extrabold text-center mb-6">What Our Customers Say</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {testimonials.map((t, i) => (
                                <div key={i} className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex mb-2">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= t.rating ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`} />)}</div>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
                                    <p className="text-xs font-bold">{t.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══ FAQ ═══ */}
                {faqItems.length > 0 && (
                    <section className="px-4 py-10">
                        <h2 className="text-lg font-extrabold text-center mb-6">Frequently Asked Questions</h2>
                        <div className="max-w-2xl mx-auto space-y-2">
                            {faqItems.map((item, i) => (
                                <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                                    <button
                                        className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        {item.q}
                                        {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══ NEWSLETTER ═══ */}
                <section className="px-4 py-10 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="max-w-md mx-auto text-center">
                        <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: themeColor }} />
                        <h2 className="text-lg font-extrabold mb-2">Stay Updated</h2>
                        <p className="text-sm text-muted-foreground mb-4">Get notified about new products and exclusive offers.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter your email"
                                value={nlEmail}
                                onChange={e => setNlEmail(e.target.value)}
                                className="h-11 rounded-xl flex-1"
                            />
                            <Button className="h-11 rounded-xl px-6 font-bold text-white" style={{ backgroundColor: themeColor }}>
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1">
                            <Link href={`/store/${slug}`} className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: themeColor }}>
                                    {storeName[0]?.toUpperCase()}
                                </div>
                                <span className="font-extrabold" style={{ color: themeColor }}>{storeName}</span>
                            </Link>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{tagline}</p>
                            <div className="flex gap-2">
                                {settings.footer?.social?.facebook && (
                                    <a href={settings.footer.social.facebook} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition hover:text-blue-600">
                                        <Facebook className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {settings.footer?.social?.instagram && (
                                    <a href={settings.footer.social.instagram} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition hover:text-pink-600">
                                        <Instagram className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bold text-sm mb-3">Quick Links</h4>
                            <nav className="space-y-2 text-xs text-muted-foreground">
                                <Link href={`/store/${slug}`} className="block hover:text-foreground transition">Home</Link>
                                <Link href={`/store/${slug}/search`} className="block hover:text-foreground transition">Search</Link>
                                <Link href={`/store/${slug}/track`} className="block hover:text-foreground transition">Track Order</Link>
                                <button onClick={onCartClick} className="block hover:text-foreground transition">Cart</button>
                            </nav>
                        </div>

                        {/* Categories */}
                        <div>
                            <h4 className="font-bold text-sm mb-3">Categories</h4>
                            <nav className="space-y-2 text-xs text-muted-foreground">
                                {rawCategories.slice(0, 5).map(cat => (
                                    <button key={cat} className="block hover:text-foreground transition capitalize" onClick={() => { setSelectedCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }) }}>
                                        {cat}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold text-sm mb-3">Contact</h4>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> WhatsApp Available</p>
                                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Bangladesh</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
                        <p className="text-[10px] text-neutral-400">
                            © {new Date().getFullYear()} {storeName}. Powered by <span className="font-bold" style={{ color: themeColor }}>F-Manager</span>
                        </p>
                    </div>
                </div>
            </footer>

            {/* ═══ WHATSAPP FAB ═══ */}
            {settings.whatsapp_number && (
                <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(storeName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50 animate-bounce"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </a>
            )}
        </div>
    )
}
