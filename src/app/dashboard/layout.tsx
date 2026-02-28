"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard, Package, Settings, ShoppingCart,
    Menu, X, ChevronRight, Users, Truck, BarChart3, ClipboardList, UserPlus, LogOut, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/f-manager/ThemeToggle"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

const NAV_ITEMS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/quick-sell", label: "Quick Sell (POS)", icon: ShoppingCart },
    { href: "/dashboard#orders", label: "Orders", icon: ClipboardList },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard#customers", label: "Customers", icon: Users },
    { href: "/dashboard#courier", label: "Courier Log", icon: Truck },
    { href: "/dashboard#analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/workers", label: "Workers", icon: UserPlus },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
    onClose?: () => void
    user: User | null
    sellerName: string
    onSignOut: () => void
}

function Sidebar({ onClose, user, sellerName, onSignOut }: SidebarProps) {
    const pathname = usePathname()
    const initials = sellerName ? sellerName[0].toUpperCase() : "S"

    return (
        <aside className="w-64 shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-screen sticky top-0">
            {/* Brand */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <Link href="/" className="font-extrabold text-lg text-teal-600 dark:text-teal-400 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    F-Manager
                </Link>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-1">
                {NAV_ITEMS.map((item) => {
                    const isOverview = item.href === "/dashboard" && pathname === "/dashboard"
                    const isExact = !item.href.includes("#") && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                    const active = isOverview || isExact
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                ? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                                : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground"
                                }`}
                        >
                            <item.icon className="h-[18px] w-[18px] shrink-0" />
                            {item.label}
                            {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom: User + Theme + Sign Out */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300">
                            {initials}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground truncate max-w-[110px]">{sellerName || "My Store"}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[110px]">{user?.email || ""}</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex gap-2">
                    <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                        ← Site
                    </Link>
                    <span className="text-muted-foreground">·</span>
                    <button
                        onClick={onSignOut}
                        className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                    >
                        <LogOut className="h-3 w-3" /> Sign Out
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [sellerName, setSellerName] = useState("")
    const [authChecked, setAuthChecked] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace("/auth/signin")
                return
            }
            setUser(session.user)
            // Load seller name for this user
            supabase
                .from("sellers")
                .select("name")
                .eq("user_id", session.user.id)
                .single()
                .then(({ data }) => {
                    if (data) setSellerName(data.name)
                })
            setAuthChecked(true)
        })

        // Listen for auth state changes (sign out etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                router.replace("/auth/signin")
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.replace("/auth/signin")
    }

    // While checking auth, show a spinner
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a]">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex">
            {/* Desktop Sidebar — always visible, static */}
            <div className="hidden md:block">
                <Sidebar user={user} sellerName={sellerName} onSignOut={handleSignOut} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 md:hidden">
                        <Sidebar onClose={() => setMobileOpen(false)} user={user} sellerName={sellerName} onSignOut={handleSignOut} />
                    </div>
                </>
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                {/* Mobile top bar */}
                <header className="h-14 flex items-center gap-4 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 md:hidden sticky top-0 z-20">
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-extrabold text-teal-600 dark:text-teal-400">F-Manager</span>
                    <button
                        onClick={handleSignOut}
                        className="ml-auto text-xs text-red-500 font-medium flex items-center gap-1"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
