"use client"

import React, { use, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ProductDetailPage } from "@/components/store/ProductDetailPage"
import { StoreCartProvider, useStoreCart } from "@/lib/StoreCartContext"
import { Loader2, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { sanitizeImageUrls } from "@/lib/imageUtils"

function ProductPageInner({ slug, productId }: { slug: string; productId: string }) {
    const [product, setProduct] = useState<any>(null)
    const [seller, setSeller] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { addItem } = useStoreCart()
    const router = useRouter()

    useEffect(() => {
        async function load() {
            const { data: sd } = await supabase.from("sellers").select("id, name, slug, settings").eq("slug", slug).single()
            if (!sd) { setLoading(false); return }
            setSeller(sd)

            const { data: pd } = await supabase.from("products").select("*, variants(*)").eq("id", productId).eq("seller_id", sd.id).single()
            if (pd) setProduct({ ...pd, images: sanitizeImageUrls(pd.images || []) })
            setLoading(false)
        }
        load()
    }, [slug, productId])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>
    if (!product || !seller) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                <Link href={`/store/${slug}`}><Button className="rounded-xl">Back to Store</Button></Link>
            </div>
        </div>
    )

    const settings = seller.settings || {}
    const themeColor = settings.theme_color || "#0d9488"

    return (
        <ProductDetailPage
            product={product}
            slug={slug}
            themeColor={themeColor}
            storeName={seller.name}
            onAddToCart={(item) => {
                addItem({ ...item, seller_id: seller.id })
                toast.success("Added to cart!", { description: item.name })
            }}
            onOrderNow={(item) => {
                addItem({ ...item, seller_id: seller.id })
                // Cart persists synchronously in addItem — safe to navigate immediately
                router.push(`/store/${slug}/checkout`)
            }}
        />
    )
}

export default function ProductPage({ params }: { params: Promise<{ slug: string; productId: string }> }) {
    const { slug, productId } = use(params)
    return (
        <StoreCartProvider slug={slug}>
            <ProductPageInner slug={slug} productId={productId} />
        </StoreCartProvider>
    )
}
