"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Review } from "@/lib/types"
import { Star, MessageSquare, BadgeCheck, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface CustomerReviewsProps {
    productId: string
    sellerId: string
    themeColor?: string
}

export function CustomerReviews({ productId, sellerId, themeColor = "#0d9488" }: CustomerReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    // Form state
    const [isWriting, setIsWriting] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [name, setName] = useState("")
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [orderId, setOrderId] = useState("")

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true)
            const { data } = await supabase
                .from("reviews")
                .select("*")
                .eq("product_id", productId)
                .eq("is_published", true)
                .order("created_at", { ascending: false })
            if (data) setReviews(data as Review[])
            setLoading(false)
        }
        fetchReviews()
    }, [productId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return toast.error("Please enter your name")
        if (rating < 1 || rating > 5) return toast.error("Please select a valid rating")

        setSubmitting(true)
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: productId,
                    seller_id: sellerId,
                    customer_name: name.trim(),
                    rating,
                    comment: comment.trim(),
                    order_id: orderId.trim() || undefined
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to submit review")

            toast.success("Review submitted successfully!")
            setReviews([data.data, ...reviews])
            setIsWriting(false)
            // Reset form
            setName("")
            setRating(5)
            setComment("")
            setOrderId("")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    // Stats
    const totalReviews = reviews.length
    const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
    const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: reviews.filter(r => r.rating === stars).length,
        percent: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
    }))

    if (loading) return <div className="animate-pulse h-32 bg-neutral-100 dark:bg-neutral-900 rounded-2xl full-w mt-8"></div>

    return (
        <section className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2 mb-6">
                Customer Reviews
                <span className="text-sm px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground font-medium">
                    {totalReviews}
                </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Stats Summary */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 text-center border border-neutral-100 dark:border-neutral-800">
                        <div className="text-5xl font-extrabold mb-2" style={{ color: themeColor }}>
                            {totalReviews > 0 ? avgRating.toFixed(1) : "0.0"}
                        </div>
                        <div className="flex justify-center mb-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`h-5 w-5 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800"}`} />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Based on {totalReviews} reviews</p>
                    </div>

                    <div className="space-y-2.5">
                        {ratingCounts.map(rc => (
                            <div key={rc.stars} className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 w-8 font-medium text-muted-foreground">{rc.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                                <div className="flex-1 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rc.percent}%`, backgroundColor: themeColor }} />
                                </div>
                                <span className="w-8 text-right text-muted-foreground text-xs">{rc.count}</span>
                            </div>
                        ))}
                    </div>

                    {!isWriting && (
                        <Button onClick={() => setIsWriting(true)} className="w-full rounded-xl h-12 font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                            Write a Review
                        </Button>
                    )}
                </div>

                {/* Review List & Form */}
                <div className="md:col-span-2">
                    {isWriting ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                            <h3 className="font-bold text-lg mb-4">Leave your review</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-muted-foreground">Rating</Label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button" onClick={() => setRating(s)} className="p-1 hover:scale-110 transition-transform">
                                                <Star className={`h-8 w-8 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Your Name <span className="text-red-500">*</span></Label>
                                        <Input disabled={submitting} required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="h-11 rounded-xl bg-neutral-50 dark:bg-neutral-950" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Order ID (Optional verified badge)</Label>
                                        <Input disabled={submitting} value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="ORD-..." className="h-11 rounded-xl bg-neutral-50 dark:bg-neutral-950" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Comment (Optional)</Label>
                                    <textarea
                                        disabled={submitting}
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="What did you like or dislike?"
                                        rows={4}
                                        className="w-full rounded-xl border border-input bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button disabled={submitting} type="button" variant="outline" onClick={() => setIsWriting(false)} className="flex-1 rounded-xl h-11">Cancel</Button>
                                    <Button disabled={submitting} type="submit" className="flex-1 rounded-xl h-11 font-bold text-white shadow-md shadow-teal-500/20" style={{ backgroundColor: themeColor }}>
                                        {submitting ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <MessageSquare className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                                    <h4 className="font-bold text-neutral-600 dark:text-neutral-300">No reviews yet</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Be the first to share your experience with this product.</p>
                                </div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm animate-in fade-in duration-500">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm">{review.customer_name}</span>
                                                    {review.order_id && (
                                                        <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                                            <BadgeCheck className="h-3 w-3 mr-0.5" /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-100 text-neutral-100 dark:fill-neutral-800 dark:text-neutral-800"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                                                {review.comment}
                                            </p>
                                        )}
                                        {/* Optional upvote button for authenticity feel */}
                                        <div className="mt-4 flex">
                                            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                                                <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
