"use client"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-[#0a0a0a]">
                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-red-900/20 flex items-center justify-center">
                            <span className="text-5xl">⚠️</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-2">Something went wrong</h1>
                        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
                            An unexpected error occurred. Please try again or contact support if the problem persists.
                        </p>
                        {process.env.NODE_ENV === "development" && (
                            <pre className="text-left bg-red-950/30 border border-red-900/30 rounded-xl p-4 mb-6 text-xs text-red-300 overflow-auto max-h-32">
                                {error.message}
                            </pre>
                        )}
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
