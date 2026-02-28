"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { CartItem } from "@/components/f-manager/StickyCartBar"
import { Product } from "@/components/f-manager/ProductCard"

interface CartContextType {
    cart: CartItem[]
    addToCart: (product: Product, quantity?: number) => void
    removeFromCart: (productId: string) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])

    // Load from local storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("fmanager_cart")
            if (stored) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCart(JSON.parse(stored))
            }
        } catch (e) {
            console.warn("Could not load cart from localStorage", e)
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        try {
            localStorage.setItem("fmanager_cart", JSON.stringify(cart))
        } catch (e) {
            console.warn("Could not save cart to localStorage", e)
        }
    }, [cart])

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id)
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                )
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity }]
        })
    }

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId))
    }

    const clearCart = () => setCart([])

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
