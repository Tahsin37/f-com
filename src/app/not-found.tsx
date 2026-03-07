import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                    <span className="text-5xl">🔍</span>
                </div>
                <h1 className="text-6xl font-extrabold text-teal-600 mb-2">404</h1>
                <h2 className="text-xl font-bold text-foreground mb-3">Page Not Found</h2>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/" className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors">
                        Go Home
                    </Link>
                    <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-sm font-bold transition-colors">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
