"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ChevronRight } from "lucide-react"

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

interface StickyCartBarProps {
    items: CartItem[]
    onOrderNow: () => void
}

export function StickyCartBar({ items, onOrderNow }: StickyCartBarProps) {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    if (totalItems === 0) return null

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-safe animate-in slide-in-from-bottom-full duration-300 md:hidden">
            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-3xl p-2 shadow-2xl flex items-center justify-between gap-3 ring-1 ring-black/5">
                <div className="flex items-center pl-4 space-x-3">
                    <div className="relative">
                        <ShoppingBag className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                        <span className="font-extrabold text-lg leading-none">৳ {totalPrice.toLocaleString()}</span>
                    </div>
                </div>

                <Button
                    onClick={onOrderNow}
                    className="rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all text-white font-bold h-12 px-6 shadow-lg shadow-teal-500/25 flex items-center group"
                >
                    Order Now
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    )
}
