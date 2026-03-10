import React from "react"

/* Reusable skeleton building blocks for mobile-first loading states */

export function SkeletonPulse({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-lg ${className}`} style={style} />
}

/* Store page skeleton */
export function StorePageSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] px-4">
                <div className="h-14 flex items-center gap-4 max-w-7xl mx-auto">
                    <SkeletonPulse className="h-8 w-8 rounded-lg" />
                    <SkeletonPulse className="h-8 w-24" />
                    <div className="flex-1" />
                    <SkeletonPulse className="h-10 w-full max-w-xs rounded-full hidden md:block" />
                    <SkeletonPulse className="h-10 w-20 rounded-full" />
                </div>
                {/* Mobile search */}
                <div className="md:hidden pb-3">
                    <SkeletonPulse className="h-10 w-full rounded-full" />
                </div>
                {/* Category pills */}
                <div className="flex gap-2 py-2 overflow-hidden">
                    {[80, 60, 70, 55, 65, 50].map((w, i) => (
                        <SkeletonPulse key={i} className={`h-8 shrink-0 rounded-full`} style={{ width: w }} />
                    ))}
                </div>
            </div>

            {/* Hero */}
            <div className="px-4 mt-4 max-w-7xl mx-auto">
                <SkeletonPulse className="h-48 sm:h-64 md:h-80 w-full rounded-2xl" />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 mt-6 max-w-7xl mx-auto">
                {[1, 2, 3, 4].map(i => (
                    <SkeletonPulse key={i} className="h-16 rounded-2xl" />
                ))}
            </div>

            {/* Category Grid */}
            <div className="px-4 mt-12 max-w-7xl mx-auto">
                <div className="flex justify-between mb-6">
                    <SkeletonPulse className="h-8 w-40" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonPulse key={i} className={`rounded-[2rem] ${i === 0 || i === 3 ? 'aspect-square md:aspect-[4/5]' : 'aspect-square md:aspect-[4/5]'}`} />
                    ))}
                </div>
            </div>

            {/* Product grid */}
            <div className="px-4 mt-12 max-w-7xl mx-auto">
                <div className="flex justify-between mb-4">
                    <SkeletonPulse className="h-6 w-32" />
                    <SkeletonPulse className="h-8 w-28 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 overflow-hidden">
                            <SkeletonPulse className="aspect-[4/5] rounded-none" />
                            <div className="p-4 space-y-3">
                                <SkeletonPulse className="h-3 w-12" />
                                <SkeletonPulse className="h-4 w-full" />
                                <SkeletonPulse className="h-3 w-16" />
                                <SkeletonPulse className="h-5 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* Product detail skeleton */
export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24">
            <div className="sticky top-0 z-50 border-b bg-white dark:bg-[#0a0a0a] px-4">
                <div className="h-12 flex items-center gap-3 max-w-5xl mx-auto">
                    <SkeletonPulse className="h-4 w-24" />
                    <div className="flex-1" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                    <SkeletonPulse className="h-8 w-8 rounded-full" />
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <SkeletonPulse className="aspect-square rounded-2xl" />
                <div className="space-y-4">
                    <SkeletonPulse className="h-3 w-16" />
                    <SkeletonPulse className="h-8 w-3/4" />
                    <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <SkeletonPulse key={i} className="h-4 w-4 rounded-full" />)}</div>
                    <SkeletonPulse className="h-10 w-40" />
                    <SkeletonPulse className="h-4 w-24" />
                    <div className="flex gap-2">{[1, 2, 3].map(i => <SkeletonPulse key={i} className="h-11 w-20 rounded-xl" />)}</div>
                    <div className="flex gap-2">{[1, 2].map(i => <SkeletonPulse key={i} className="h-12 flex-1 rounded-xl" />)}</div>
                </div>
            </div>
        </div>
    )
}

/* Dashboard skeleton */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <SkeletonPulse className="h-8 w-48" />
                <SkeletonPulse className="h-10 w-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <SkeletonPulse key={i} className="h-24 rounded-xl" />
                ))}
            </div>
            <SkeletonPulse className="h-64 rounded-xl" />
        </div>
    )
}

/* Checkout skeleton */
export function CheckoutSkeleton() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
            <div className="sticky top-0 border-b bg-white dark:bg-[#0a0a0a] px-4">
                <div className="max-w-3xl mx-auto h-12 flex items-center">
                    <SkeletonPulse className="h-4 w-20" />
                    <div className="flex-1" />
                    <SkeletonPulse className="h-4 w-16 mx-auto" />
                </div>
            </div>
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {[1, 2, 3, 4].map(i => (
                    <SkeletonPulse key={i} className="h-40 rounded-xl" />
                ))}
                <SkeletonPulse className="h-14 rounded-xl" />
            </div>
        </div>
    )
}
