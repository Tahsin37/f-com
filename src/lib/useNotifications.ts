"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

/**
 * Real-time order notifications using Supabase Realtime.
 * Listens for INSERT events on the orders table for the seller.
 */
export function useOrderNotifications(sellerId: string) {
    useEffect(() => {
        if (!sellerId) return

        const channel = supabase
            .channel(`orders-${sellerId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders",
                    filter: `seller_id=eq.${sellerId}`,
                },
                (payload) => {
                    const order = payload.new as any
                    toast.success("🛒 New Order Received!", {
                        description: `Order ${order.order_number} — ৳${order.total?.toLocaleString() || "0"} from ${order.customer_name || "Customer"}`,
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sellerId])
}
