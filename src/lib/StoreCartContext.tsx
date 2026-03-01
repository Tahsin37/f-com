"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import type { CartItem } from "@/lib/types"

interface StoreCartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string, variantId?: string) => void
    updateQuantity: (id: string, qty: number, variantId?: string) => void
    clearCart: () => void
    itemCount: number
    subtotal: number
}

const StoreCartContext = createContext<StoreCartContextType | null>(null)

export function useStoreCart() {
    const ctx = useContext(StoreCartContext)
    if (!ctx) throw new Error("useStoreCart must be inside StoreCartProvider")
    return ctx
}

function getStorageKey(slug: string) {
    return `fmanager_cart_${slug}`
}

/**
 * Helper: write cart to localStorage SYNCHRONOUSLY
 * This is critical for Order Now flow — we must persist
 * before router.push() navigates to checkout.
 */
function persistCart(slug: string, items: CartItem[]) {
    try {
        localStorage.setItem(getStorageKey(slug), JSON.stringify(items))
    } catch { /* ignore quota errors */ }
}

export function StoreCartProvider({ slug, children }: { slug: string; children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [hydrated, setHydrated] = useState(false)

    // Load from localStorage on mount (once)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(getStorageKey(slug))
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) setItems(parsed)
            }
        } catch { /* ignore */ }
        setHydrated(true)
    }, [slug])

    // Persist to localStorage on change — but ONLY after hydration
    // (to avoid writing empty array on initial mount before load)
    useEffect(() => {
        if (hydrated) persistCart(slug, items)
    }, [items, slug, hydrated])

    const addItem = useCallback((item: CartItem) => {
        setItems(prev => {
            const key = item.variant_id ? `${item.id}_${item.variant_id}` : item.id
            const idx = prev.findIndex(i => {
                const iKey = i.variant_id ? `${i.id}_${i.variant_id}` : i.id
                return iKey === key
            })
            let next: CartItem[]
            if (idx >= 0) {
                next = [...prev]
                next[idx] = { ...next[idx], quantity: next[idx].quantity + (item.quantity || 1) }
            } else {
                next = [...prev, { ...item, quantity: item.quantity || 1 }]
            }
            // SYNC persist — critical for Order Now → checkout navigation
            persistCart(slug, next)
            return next
        })
    }, [slug])

    const removeItem = useCallback((id: string, variantId?: string) => {
        setItems(prev => {
            const next = prev.filter(i => {
                if (variantId) return !(i.id === id && i.variant_id === variantId)
                return i.id !== id
            })
            persistCart(slug, next)
            return next
        })
    }, [slug])

    const updateQuantity = useCallback((id: string, qty: number, variantId?: string) => {
        if (qty <= 0) return removeItem(id, variantId)
        setItems(prev => {
            const next = prev.map(i => {
                const match = variantId
                    ? (i.id === id && i.variant_id === variantId)
                    : (i.id === id)
                return match ? { ...i, quantity: qty } : i
            })
            persistCart(slug, next)
            return next
        })
    }, [removeItem, slug])

    const clearCart = useCallback(() => {
        setItems([])
        try { localStorage.removeItem(getStorageKey(slug)) } catch { /* ignore */ }
    }, [slug])

    const itemCount = items.reduce((s, i) => s + i.quantity, 0)
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

    return (
        <StoreCartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
            {children}
        </StoreCartContext.Provider>
    )
}
