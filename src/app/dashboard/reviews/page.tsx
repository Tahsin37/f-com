"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Star, Loader2, Plus, MessageSquare, Trash2, Package } from "lucide-react"

interface LocalReview {
    id: string
    customer_name: string
    rating: number
    comment: string
    created_at: string
}

interface ProductWithReviews extends Product {
    parsedReviews: LocalReview[]
}

export default function ReviewsPage() {
    const [products, setProducts] = useState<ProductWithReviews[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [isAdding, setIsAdding] = useState(false)
    const [newReview, setNewReview] = useState({ customer_name: "", rating: 5, comment: "" })

    async function loadData() {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) { setLoading(false); return }

        const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", userId).single()
        if (!seller) { setLoading(false); return }

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("seller_id", seller.id)
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to load products")
        } else {
            const parsed = (data || []).map(p => ({
                ...p,
                parsedReviews: Array.isArray((p.metadata as any)?.reviews) ? (p.metadata as any).reviews : []
            }))
            setProducts(parsed)
        }
        setLoading(false)
    }

    useEffect(() => { loadData() }, [])

    const handleSaveReview = async () => {
        if (!selectedProduct || !newReview.customer_name || !newReview.comment) {
            toast.error("Please fill all fields")
            return
        }
        const product = products.find(p => p.id === selectedProduct)
        if (!product) return

        const review: LocalReview = {
            id: crypto.randomUUID(),
            customer_name: newReview.customer_name,
            rating: Number(newReview.rating),
            comment: newReview.comment,
            created_at: new Date().toISOString()
        }

        const updatedReviews = [review, ...product.parsedReviews]
        const newMetadata = { ...(product.metadata as any || {}), reviews: updatedReviews }

        const { error } = await supabase
            .from("products")
            .update({ metadata: newMetadata })
            .eq("id", product.id)

        if (error) {
            toast.error("Failed to add review")
        } else {
            toast.success("Review added!")
            setIsAdding(false)
            setNewReview({ customer_name: "", rating: 5, comment: "" })
            loadData()
        }
    }

    const handleDeleteReview = async (productId: string, reviewId: string) => {
        if (!confirm("Delete this review?")) return
        const product = products.find(p => p.id === productId)
        if (!product) return

        const updatedReviews = product.parsedReviews.filter(r => r.id !== reviewId)
        const newMetadata = { ...(product.metadata as any || {}), reviews: updatedReviews }

        const { error } = await supabase
            .from("products")
            .update({ metadata: newMetadata })
            .eq("id", product.id)

        if (error) {
            toast.error("Failed to delete review")
        } else {
            toast.success("Review deleted")
            loadData()
        }
    }

    const allReviews = products.flatMap(p => p.parsedReviews.map(r => ({ ...r, productName: p.name, productId: p.id })))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Product Reviews</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage what customers are saying about your products</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl">
                    <Plus className="h-4 w-4" /> Add Review
                </Button>
            </div>

            {isAdding && (
                <Card className="border-teal-100 dark:border-teal-900 shadow-md">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg">New Manual Review</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Product</label>
                                <select
                                    className="w-full h-10 rounded-lg border bg-transparent px-3 text-sm"
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                >
                                    <option value="" disabled>Choose a product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer Name</label>
                                <Input
                                    placeholder="e.g. John Doe"
                                    value={newReview.customer_name}
                                    onChange={e => setNewReview({ ...newReview, customer_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating (1-5)</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                        <Star className={`h-8 w-8 ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Review Comment</label>
                            <Textarea
                                placeholder="Write the review..."
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                        <Button onClick={handleSaveReview} className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white mt-4">Save Review</Button>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
            ) : allReviews.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl mt-6">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm">Manually add positive feedback to build trust</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {allReviews.map(r => (
                        <Card key={r.id}>
                            <CardContent className="p-5 flex flex-col h-full relative">
                                <button
                                    onClick={() => handleDeleteReview(r.productId, r.id)}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700'}`} />)}
                                </div>
                                <p className="font-medium text-sm mb-4 line-clamp-3">"{r.comment}"</p>
                                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold">{r.customer_name}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Package className="h-3 w-3" /> {r.productName}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
