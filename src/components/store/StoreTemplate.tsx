"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search, ShoppingCart, ChevronRight, ChevronLeft, Star, Truck, Clock,
    ShieldCheck, Award, Zap, Heart, ChevronDown, ChevronUp,
    Mail, ArrowRight, Facebook, Instagram, Phone, MapPin, Menu, X, Filter, SlidersHorizontal, Trash2
} from "lucide-react"
import { useTheme as useThemeContext } from "@/components/store/ThemeProvider"
import { useStoreCart } from "@/lib/StoreCartContext"

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
    bannerImages?: string[]
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

/* ─── StoreProductImage Component ────────────────────────────────────────────── */

function StoreProductImage({ images, name }: { images: string[], name: string }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (!images || images.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length)
        }, 3000)
        return () => clearInterval(timer)
    }, [images])

    if (!images || images.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-4xl text-neutral-300">📦</div>
    }

    return (
        <div className="relative w-full h-full group">
            {images.map((img, i) => (
                <Image
                    key={i}
                    src={img}
                    alt={`${name} ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className={`object-cover transition-opacity duration-1000 ease-in-out ${i === currentIndex ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transform`}
                />
            ))}
        </div>
    )
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export function StoreTemplate({
    storeName, tagline, themeColor, bannerImage, bannerImages, bannerTitle, bannerSubtitle,
    bannerCta, campaigns, products, rawCategories = [], cartCount, search, onSearchChange,
    onAddToCart, onQuickView, onCartClick, slug, settings = {}
}: StoreTemplateProps) {

    // If a ThemeProvider is active, use its tokens for the primary color
    const themeCtx = useThemeContext()
    const effectiveColor = themeCtx.tokens?.colors?.primary || themeColor

    const effectiveProducts = settings.hide_out_of_stock ? products.filter(p => p.inStock) : products

    const [selectedCategory, setSelectedCategory] = useState("all")
    const [sortBy, setSortBy] = useState("newest")
    const [heroSlide, setHeroSlide] = useState(0)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [nlEmail, setNlEmail] = useState("")
    const [searchFocused, setSearchFocused] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const heroRef = useRef<HTMLDivElement>(null)
    const { items: cartItems, removeItem, updateQuantity, subtotal } = useStoreCart()

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

    // Hero slides (use multiple banner images if available, else fallback to single bannerImage)
    const baseHeroSlides = bannerImages && bannerImages.length > 0
        ? bannerImages.map(img => ({ image: img, title: bannerTitle, subtitle: bannerSubtitle, cta: bannerCta }))
        : [{ image: bannerImage, title: bannerTitle, subtitle: bannerSubtitle, cta: bannerCta }];

    const heroSlides = [
        ...baseHeroSlides,
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
        const speed = settings.banner_slider_speed ? Number(settings.banner_slider_speed) * 1000 : 3000;
        const timer = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), Math.max(2000, speed))
        return () => clearInterval(timer)
    }, [heroSlides.length, settings.banner_slider_speed])

    // Extract recent reviews from all products
    const productReviews = useMemo(() => {
        const all = products.flatMap(p => {
            const revs: any[] = Array.isArray((p.metadata as any)?.reviews) ? (p.metadata as any).reviews : []
            return revs.map(r => ({
                name: r.customer_name,
                text: r.comment,
                rating: r.rating,
                created_at: r.created_at
            }))
        })
        return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
    }, [products])

    // Testimonials & FAQ from settings
    const testimonials: Array<{ name: string; text: string; rating: number }> = productReviews.length > 0 ? productReviews : (settings.testimonials || [
        { name: "Sabrina R.", text: "Amazing quality! Delivery was super fast. Will order again ❤️", rating: 5 },
        { name: "Rafiq H.", text: "Best price and genuine products. Highly recommended!", rating: 5 },
        { name: "Nusrat F.", text: "Customer service is excellent. Love the packaging!", rating: 4 },
    ])

    const faqItems: Array<{ q: string; a: string }> = settings.faq || [
        { q: "How long does delivery take?", a: "Inside Dhaka: 1-2 days. Outside Dhaka: 2-4 days." },
        { q: "What payment methods do you accept?", a: "Cash on Delivery (COD), bKash, and Nagad." },
        { q: "Can I return a product?", a: "Yes, within 3 days of delivery if the product is unused and in original packaging." },
        { q: "Is there a minimum order amount?", a: "No minimum order. Free delivery on orders above ৳999." },
    ]

    // Announcement bar
    const announcement = settings.announcement_bar
    const t = settings.store_text || {}

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100">

            {/* ═══ ANNOUNCEMENT BAR ═══ */}
            {announcement?.enabled && (
                <div className="text-center py-2 px-4 text-xs font-medium" style={{ backgroundColor: announcement.bg_color || effectiveColor, color: announcement.text_color || '#fff' }}>
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
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: effectiveColor }}>
                                {storeName[0]?.toUpperCase()}
                            </div>
                            <span className="font-extrabold text-lg hidden sm:inline" style={{ color: effectiveColor }}>{storeName}</span>
                        </Link>

                        {/* Search */}
                        <div className="flex-1 max-w-lg mx-auto relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder={t.search_placeholder || `Search in ${storeName}...`}
                                value={search}
                                onChange={e => {
                                    onSearchChange(e.target.value)
                                    setSearchFocused(true)
                                }}
                                onFocus={() => setSearchFocused(true)}
                                className="pl-10 h-10 rounded-full border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus-visible:ring-1 focus-visible:ring-teal-500"
                            />

                            {/* Live Search Dropdown Overlay */}
                            {searchFocused && search.length > 0 && (
                                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                                    <div className="p-3 bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs font-semibold text-muted-foreground">
                                        <span>Products</span>
                                        <span>{filtered.length} results</span>
                                    </div>
                                    <div className="overflow-y-auto p-2 space-y-1">
                                        {filtered.length > 0 ? (
                                            filtered.slice(0, 5).map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        onQuickView(product)
                                                        setSearchFocused(false)
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                                                >
                                                    <div className="h-10 w-10 shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden relative">
                                                        {product.images?.[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                                                    </div>
                                                    <div className="shrink-0 text-sm font-bold" style={{ color: effectiveColor }}>
                                                        ৳{product.price.toLocaleString()}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                No products found for "{search}"
                                            </div>
                                        )}
                                        {filtered.length > 5 && (
                                            <button
                                                className="w-full p-2 text-center text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition rounded-lg mt-2"
                                                style={{ color: effectiveColor }}
                                                onClick={() => {
                                                    setSearchFocused(false)
                                                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
                                                }}
                                            >
                                                View all {filtered.length} results
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Click outside invisible overlay */}
                            {searchFocused && (
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setSearchFocused(false)}
                                    style={{ background: 'transparent' }}
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* Track Order */}
                            <Link href={`/store/${slug}/track`} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                                <Truck className="h-4 w-4" />
                                {t.nav_track_order || "Track Order"}
                            </Link>

                            {/* Cart */}
                            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white transition hover:opacity-90 shadow-sm hover:shadow active:scale-95" style={{ backgroundColor: effectiveColor }}>
                                <ShoppingCart className="h-4 w-4" />
                                <span className="hidden sm:inline">{t.nav_cart || "Cart"}</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
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
                                placeholder={t.search_placeholder || "Search products..."}
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
                                style={selectedCategory === cat ? { backgroundColor: effectiveColor } : {}}
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
                        <span className="font-extrabold text-xl" style={{ color: effectiveColor }}>{storeName}</span>
                        <button onClick={() => setMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
                    </div>
                    <nav className="space-y-4">
                        <Link href={`/store/${slug}`} className="block text-lg font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link href={`/store/${slug}/search`} className="block text-lg font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>Search</Link>
                        <Link href={`/store/${slug}/track`} className="block text-lg font-semibold py-2 border-b" onClick={() => setMobileMenuOpen(false)}>{t.nav_track_order || "Track Order"}</Link>
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
                            <h3 className="text-xl font-extrabold flex items-center gap-2"><SlidersHorizontal className="h-5 w-5" /> {t.filter_btn || "Filters"}</h3>
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
                                style={{ backgroundColor: effectiveColor }}
                            >
                                Show {sorted.length} results
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ HERO BANNER SLIDER (Full Width Premium) ═══ */}
            {heroSlides.length > 0 && (
                <section className="relative w-full h-[60vh] min-h-[500px] md:h-[85vh] overflow-hidden group" ref={heroRef}>
                    {heroSlides.map((slide, i) => (
                        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-out scale-100 group-hover:scale-[1.15]"
                                style={{ backgroundImage: slide.image ? `url('${slide.image}')` : `linear-gradient(135deg, ${effectiveColor}, ${effectiveColor}aa)` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold bg-white/10 backdrop-blur-md text-white mb-6 border border-white/20 shadow-xl transition-all duration-700 delay-100 ${i === heroSlide ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                                    <Zap className="h-3.5 w-3.5 text-yellow-400" /> Premium Collection
                                </span>
                                <h2 className={`text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl max-w-5xl leading-[1.1] transition-all duration-700 delay-200 ${i === heroSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                                    {slide.title}
                                </h2>
                                <p className={`text-base sm:text-xl md:text-2xl text-white/90 max-w-2xl mb-10 font-medium drop-shadow-lg leading-relaxed transition-all duration-700 delay-300 ${i === heroSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                                    {slide.subtitle}
                                </p>
                                <button className={`group/btn relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 rounded-full text-sm sm:text-base font-extrabold text-white shadow-2xl shadow-[color:var(--effective-color-hover)] transition-all duration-700 delay-400 hover:scale-[1.03] active:scale-95 ${i === heroSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`} style={{ backgroundColor: effectiveColor, '--effective-color-hover': `${effectiveColor}66` } as any}>
                                    <span className="relative z-10 flex items-center gap-2">{slide.cta || "Explore Now"} <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" /></span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Slider dots */}
                    {heroSlides.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                            {heroSlides.map((_, i) => (
                                <button key={i} onClick={() => setHeroSlide(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroSlide ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/60"}`} />
                            ))}
                        </div>
                    )}

                    {/* Nav arrows */}
                    {heroSlides.length > 1 && (
                        <>
                            <button onClick={() => setHeroSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center z-20 hover:bg-black/40 hover:scale-110 transition-all hidden md:flex">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button onClick={() => setHeroSlide(s => (s + 1) % heroSlides.length)} className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center z-20 hover:bg-black/40 hover:scale-110 transition-all hidden md:flex">
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}
                </section>
            )}

            {/* Scroll Indicator */}
            {heroSlides.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:flex">
                    <div className="h-10 w-6 rounded-full border-2 border-white/30 flex items-start justify-center p-1 backdrop-blur-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto">

                {/* ═══ TRUST BADGES ═══ */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-4 mt-6">
                    {[
                        { icon: Truck, label: "Fast Delivery", sub: "Inside Dhaka 24hr", emoji: "🚚" },
                        { icon: ShieldCheck, label: "OTP Secure", sub: "Verified orders", emoji: "🛡️" },
                        { icon: Award, label: "Top Rated", sub: `${products.length}+ items`, emoji: "⭐" },
                        { icon: Clock, label: "24/7 Support", sub: "WhatsApp ready", emoji: "⚡" },
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${effectiveColor}15` }}>
                                {badge.emoji}
                            </div>
                            <div>
                                <p className="text-xs font-extrabold">{badge.label}</p>
                                <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ═══ CATEGORIES SHOWCASE (Pebble Style) ═══ */}
                {categories.filter(c => c !== "all").length > 0 && selectedCategory === "all" && !search && (
                    <section className="px-4 mt-12 mb-4">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t.shop_by_category || "Shop by Category"}</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                            {categories.filter(c => c !== "all").slice(0, 4).map((cat, i) => {
                                const catProd = products.find(p => p.category === cat && p.images[0]);
                                const isLarge = i === 0; // First item is large on mobile, but let's just make them all uniform squares for consistency, or 1 large + 3 small. Let's stick to uniform aspect ratios.
                                return (
                                    <div
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`group cursor-pointer relative rounded-[2rem] overflow-hidden bg-neutral-100 dark:bg-neutral-800 ${i === 0 || i === 3 ? 'aspect-square md:aspect-[4/5]' : 'aspect-square md:aspect-[4/5]'}`}
                                    >
                                        {catProd ? (
                                            <Image src={catProd.images[0]} alt={cat} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900">📦</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                                        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 flex items-end justify-between">
                                            <div>
                                                <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Collection</p>
                                                <h3 className="text-white font-black text-xl md:text-3xl capitalize tracking-tight drop-shadow-md">{cat}</h3>
                                            </div>
                                            <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out border border-white/20">
                                                <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* ═══ FLASH DEALS ═══ */}
                {deals.length > 0 && (
                    <section className="px-4 mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <h2 className="text-lg font-extrabold">{t.flash_deals_title || "Flash Deals"}</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">{t.badge_hot || "HOT"}</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                            {deals.map(p => (
                                <div key={p.id} className="shrink-0 w-44 sm:w-56 group cursor-pointer" onClick={() => onQuickView(p)}>
                                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50">
                                        <StoreProductImage images={p.images} name={p.name} />
                                        {(p.discountPercent ?? 0) > 0 && (
                                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-lg tracking-wider uppercase">-{p.discountPercent}%</span>
                                        )}
                                    </div>
                                    <div className="mt-4 px-1">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.category}</p>
                                            <div className="flex items-center gap-0.5">
                                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                <span className="text-[10px] font-bold">{(p.rating ?? 4).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold line-clamp-2 leading-snug group-hover:underline underline-offset-4 decoration-2 min-h-[2.5em]">{p.name}</h3>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-base font-black" style={{ color: effectiveColor }}>৳{p.price.toLocaleString()}</span>
                                            {p.strikePrice && <span className="text-xs text-muted-foreground line-through font-medium">৳{p.strikePrice.toLocaleString()}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══ ALL PRODUCTS ═══ */}
                <section id="store-products" className="px-4 mt-8 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-extrabold flex-1">
                            {search ? `Results for "${search}"` : selectedCategory !== "all" ? `${selectedCategory}` : (t.all_products_title || "All Products")}
                        </h2>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowFilters(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{t.filter_btn || "Filter"}</span>
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
                                <div key={p.id} className="group cursor-pointer bg-transparent rounded-2xl overflow-hidden" onClick={() => onQuickView(p)}>
                                    <div className="relative aspect-[4/5] bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/80">
                                        <StoreProductImage images={p.images} name={p.name} />

                                        {/* Status Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            {(p.discountPercent ?? 0) > 0 && (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-md tracking-wider uppercase">-{p.discountPercent}%</span>
                                            )}
                                        </div>

                                        {!p.inStock && (
                                            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                <span className="text-neutral-900 dark:text-white text-xs font-black bg-white/90 dark:bg-black/90 px-5 py-2 rounded-full uppercase tracking-widest shadow-xl">{t.badge_sold_out || "Sold Out"}</span>
                                            </div>
                                        )}

                                        {/* Quick add - Slide up on hover (Glassmorphism) */}
                                        {p.inStock && (
                                            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hidden md:block bg-gradient-to-t from-black/60 to-transparent">
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        onAddToCart(p);
                                                        setCartOpen(true);
                                                    }}
                                                    className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-white font-bold shadow-xl backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-transform"
                                                    style={{ backgroundColor: `${effectiveColor}dd` }}
                                                >
                                                    <ShoppingCart className="h-4 w-4" /> {t.btn_quick_add || "Quick Add"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 pb-2 px-1">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.category}</p>
                                        </div>
                                        <h3 className="text-sm font-bold line-clamp-2 leading-snug group-hover:underline decoration-2 underline-offset-4 mb-2 min-h-[2.5em]">{p.name}</h3>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${s <= (p.rating ?? 4) ? "text-amber-400 fill-amber-400" : "text-neutral-200 dark:text-neutral-700"}`} />)}
                                            </div>
                                            <span className="text-[11px] font-semibold text-muted-foreground">({(p.rating ?? 4).toFixed(1)})</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-base font-black" style={{ color: effectiveColor }}>৳{p.price.toLocaleString()}</span>
                                            {p.strikePrice && <span className="text-xs text-muted-foreground line-through font-medium">৳{p.strikePrice.toLocaleString()}</span>}
                                        </div>

                                        {/* Mobile add-to-cart */}
                                        {p.inStock && (
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onAddToCart(p);
                                                    setCartOpen(true);
                                                }}
                                                className="w-full mt-3 h-10 rounded-xl text-xs font-bold text-white md:hidden active:scale-95 transition-transform shadow-md flex items-center justify-center gap-1.5"
                                                style={{ backgroundColor: effectiveColor }}
                                            >
                                                <ShoppingCart className="h-4 w-4" /> {t.btn_add_to_cart || "Add"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ═══ TESTIMONIALS (Pebble Style) ═══ */}
                {testimonials.length > 0 && (
                    <section className="py-16 md:py-24 mt-12 relative overflow-hidden">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">Loved by customers</h2>
                                    <p className="text-muted-foreground md:text-lg">Don't just take our word for it.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {testimonials.map((t, i) => (
                                    <div key={i} className="shrink-0 w-[280px] md:w-[360px] snap-center bg-neutral-50 dark:bg-neutral-900/40 p-6 md:p-8 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col overflow-hidden">
                                        <div className="flex mb-6 gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-5 w-5 ${s <= t.rating ? "text-amber-400 fill-amber-400" : "text-neutral-100 dark:text-neutral-800 fill-neutral-100 dark:fill-neutral-800"}`} />)}
                                        </div>
                                        <p className="text-base md:text-xl font-medium leading-relaxed mb-8">"{t.text}"</p>
                                        <div className="flex items-center gap-4 mt-auto pt-6">
                                            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center font-bold text-lg" style={{ color: effectiveColor }}>
                                                {t.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm md:text-base tracking-tight">{t.name}</p>
                                                <p className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1"><ShieldCheck className="h-3 w-3" /> Verified Buyer</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                <section className="px-4 py-16 md:py-24 bg-transparent border-t border-neutral-100 dark:border-neutral-800">
                    <div className="max-w-xl mx-auto text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 shadow-xl" style={{ backgroundColor: `${effectiveColor}20`, color: effectiveColor }}>
                            <Mail className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">Stay Updated</h2>
                        <p className="md:text-lg text-muted-foreground mb-8">Get notified about new products, exclusive offers, and the latest trends.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter your email"
                                value={nlEmail}
                                onChange={e => setNlEmail(e.target.value)}
                                className="h-11 rounded-xl flex-1"
                            />
                            <Button className="h-11 rounded-xl px-6 font-bold text-white" style={{ backgroundColor: effectiveColor }}>
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
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: effectiveColor }}>
                                    {storeName[0]?.toUpperCase()}
                                </div>
                                <span className="font-extrabold" style={{ color: effectiveColor }}>{storeName}</span>
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
                            <h4 className="font-bold text-sm mb-3">{t.footer_quick_links || "Quick Links"}</h4>
                            <nav className="space-y-2 text-xs text-muted-foreground">
                                <Link href={`/store/${slug}`} className="block hover:text-foreground transition">Home</Link>
                                <Link href={`/store/${slug}/search`} className="block hover:text-foreground transition">Search</Link>
                                <Link href={`/store/${slug}/track`} className="block hover:text-foreground transition">Track Order</Link>
                                <button onClick={onCartClick} className="block hover:text-foreground transition">Cart</button>
                            </nav>
                        </div>

                        {/* Categories */}
                        <div>
                            <h4 className="font-bold text-sm mb-3">{t.footer_categories || "Categories"}</h4>
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
                            <h4 className="font-bold text-sm mb-3">{t.footer_contact || "Contact"}</h4>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> WhatsApp Available</p>
                                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Bangladesh</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
                        <p className="text-[10px] text-neutral-400">
                            © {new Date().getFullYear()} {storeName}. Powered by <span className="font-bold" style={{ color: effectiveColor }}>F-Manager</span>
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

            {/* ═══ CUSTOM CSS (from Theme Studio) ═══ */}
            {settings.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />
            )}

            {/* ═══ CUSTOM HTML SECTIONS (from Theme Studio) ═══ */}
            {settings.custom_html && (
                <div dangerouslySetInnerHTML={{ __html: settings.custom_html }} />
            )}

            {/* ═══ SLIDE-OUT MINI CART ═══ */}
            {cartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 border-l border-neutral-100 dark:border-neutral-800">
                        {/* Cart Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
                            <h2 className="font-extrabold text-lg flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" style={{ color: effectiveColor }} />
                                Your Cart
                                <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs text-muted-foreground">{cartCount}</span>
                            </h2>
                            <button onClick={() => setCartOpen(false)} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="h-20 w-20 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center">
                                        <ShoppingCart className="h-8 w-8 text-neutral-300" />
                                    </div>
                                    <p className="font-semibold text-neutral-500">Your cart is empty.</p>
                                    <Button onClick={() => setCartOpen(false)} className="rounded-full rounded-tl-sm mt-4">Continue Shopping</Button>
                                </div>
                            ) : (
                                cartItems.map(item => {
                                    const uniqueKey = item.variant_id ? `${item.id}_${item.variant_id}` : item.id;
                                    return (
                                        <div key={uniqueKey} className="flex gap-4 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl items-center shadow-sm">
                                            <div className="h-16 w-16 bg-white dark:bg-black rounded-xl overflow-hidden shrink-0 border border-neutral-100 dark:border-neutral-800">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-3 bg-white dark:bg-black px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)} className="text-muted-foreground hover:text-foreground text-xs font-medium w-4 text-center">-</button>
                                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)} className="text-muted-foreground hover:text-foreground text-xs font-medium w-4 text-center">+</button>
                                                    </div>
                                                    <button onClick={() => removeItem(item.id, item.variant_id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition ml-auto">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm text-right shrink-0" style={{ color: effectiveColor }}>
                                                ৳{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-muted-foreground">Subtotal</span>
                                    <span className="font-extrabold text-xl">৳{subtotal.toLocaleString()}</span>
                                </div>
                                <Button
                                    className="w-full h-12 rounded-2xl text-base font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                                    style={{ backgroundColor: effectiveColor, boxShadow: `0 10px 25px -5px ${effectiveColor}80` }}
                                    onClick={() => {
                                        setCartOpen(false);
                                        onCartClick();
                                    }}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
