"use client"

import React, { use, useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Product as DBProduct } from "@/lib/types"
import { sanitizeImageUrls } from "@/lib/imageUtils"
import { StarterTemplate } from "@/components/store/StarterTemplate"
import { ProTemplate } from "@/components/store/ProTemplate"
import { StoreCartProvider, useStoreCart } from "@/lib/StoreCartContext"
import { ProductDrawer } from "@/components/f-manager/ProductDrawer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { StorePageSkeleton } from "@/components/store/Skeletons"

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
        discountPercent: p.discount > 0 ? Math.round(p.discount) : undefined,
        images: sanitizeImageUrls(p.images ?? []),
        variants: (p.variants ?? []).map(v => ({ id: v.id, name: v.label })),
        inStock: hasStock,
        category: p.category,
        metadata: p.metadata,
        description: p.description,
    }
}

function StoreInner({ slug }: { slug: string }) {
    const { addItem, itemCount } = useStoreCart()
    const router = useRouter()

    const [sellerData, setSellerData] = useState<any>(null)
    const [products, setProducts] = useState<ReturnType<typeof mapProduct>[]>([])
    const [rawCategories, setRawCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [drawerProduct, setDrawerProduct] = useState<ReturnType<typeof mapProduct> | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        async function load() {
            const { data: sd } = await supabase
                .from("sellers")
                .select("id, name, slug, settings")
                .eq("slug", slug)
                .single()
            if (!sd) { setLoading(false); return }
            setSellerData(sd)

            const { data: pd } = await supabase
                .from("products")
                .select("*, variants(*)")
                .eq("seller_id", sd.id)
                .eq("is_active", true)
                .order("created_at", { ascending: false })

            if (pd) {
                setProducts(pd.map(mapProduct))
                setRawCategories([...new Set(pd.map((p: any) => p.category as string))])
            }
            setLoading(false)
        }
        load()
    }, [slug])

    const handleAddToCart = useCallback((product: any) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0],
        })
        toast.success("Added to cart!", {
            description: product.name,
            action: { label: "Checkout →", onClick: () => router.push(`/store/${slug}/checkout`) },
        })
    }, [addItem, router, slug])

    const handleQuickView = useCallback((product: any) => {
        // Navigate to PDP
        router.push(`/store/${slug}/product/${product.id}`)
    }, [router, slug])

    const handleCartClick = useCallback(() => {
        router.push(`/store/${slug}/checkout`)
    }, [router, slug])

    if (loading) {
        return <StorePageSkeleton />
    }

    if (!sellerData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h2 className="text-2xl font-bold mb-2">Store Not Found</h2>
                    <p className="text-muted-foreground text-sm mb-6">This store doesn&apos;t exist or may have been removed.</p>
                    <Link href="/"><Button className="rounded-xl">Go Home</Button></Link>
                </div>
            </div>
        )
    }

    const settings = sellerData.settings || {}
    const templateType = settings.store_template || "pro"
    const templateProps = {
        storeName: sellerData.name,
        tagline: settings.store_tagline || "Quality products with fast delivery! 🇧🇩",
        themeColor: settings.theme_color || "#0d9488",
        bannerImage: settings.banner_image || "",
        bannerTitle: settings.banner_title || `${sellerData.name} — New Arrivals`,
        bannerSubtitle: settings.banner_subtitle || "Free delivery on orders above ৳999",
        bannerCta: settings.banner_cta || "Shop Now",
        products,
        rawCategories,
        cartCount: itemCount,
        search,
        onSearchChange: setSearch,
        onAddToCart: handleAddToCart,
        onQuickView: handleQuickView,
        onCartClick: handleCartClick,
        slug,
        settings,
    }

    return (
        <>
            {templateType === "starter" ? (
                <StarterTemplate {...templateProps} />
            ) : (
                <ProTemplate {...templateProps} />
            )}

            <ProductDrawer
                product={drawerProduct as any}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    )
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    return (
        <StoreCartProvider slug={slug}>
            <StoreInner slug={slug} />
        </StoreCartProvider>
    )
}
