"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirect old /demo/[seller] URLs to /store/[slug]
export default function DemoRedirect({ params }: { params: Promise<{ seller: string }> }) {
    const { seller } = use(params)
    const router = useRouter()

    useEffect(() => {
        router.replace(`/store/${seller}`)
    }, [seller, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Redirecting to store...</p>
        </div>
    )
}
