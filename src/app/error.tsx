"use client"

import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground mb-2">Something went wrong</h1>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === "development" && (
                    <pre className="text-left bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-6 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                        {error.message}
                    </pre>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors"
                    >
                        Try Again
                    </button>
                    <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-sm font-bold transition-colors">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
