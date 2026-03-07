"use client"

import { useEffect, useState } from "react"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => { })
        }

        // Listen for install prompt
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // Don't show if user dismissed before
            const dismissed = localStorage.getItem("pwa-dismissed")
            if (!dismissed) setShowBanner(true)
        }

        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
            setShowBanner(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowBanner(false)
        localStorage.setItem("pwa-dismissed", "1")
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-[380px] animate-in slide-in-from-bottom duration-500">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                    <Download className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold mb-0.5">Install F-Manager</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Add to your home screen for faster access & offline support.
                    </p>
                    <button
                        onClick={handleInstall}
                        className="mt-3 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                    >
                        Install App
                    </button>
                </div>
                <button onClick={handleDismiss} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
