"use client"

import React, { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { LocaleToggle } from "./LocaleToggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, BarChart3, CreditCard, Truck, Smartphone } from "lucide-react"

const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/demo", label: "Demo" },
]

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-teal-600 dark:text-teal-400">
                        F-Manager
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <LocaleToggle />
                    <ThemeToggle />
                    <Link href="/auth/signin">
                        <Button variant="ghost" size="sm" className="font-semibold rounded-full px-5">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button size="sm" className="font-bold rounded-full px-5 bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20">
                            Get Started Free
                        </Button>
                    </Link>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center gap-2">
                    <LocaleToggle />
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-black px-4 py-6 flex flex-col gap-4">
                    {navLinks.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-base font-semibold text-foreground py-2 border-b border-neutral-100 dark:border-neutral-800"
                        >
                            {l.label}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 pt-2">
                        <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                            <Button variant="outline" className="w-full font-bold rounded-xl">Sign In</Button>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                            <Button className="w-full font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white">Get Started Free</Button>
                        </Link>
                    </div>
                    <div className="flex gap-3 pt-2 text-xs text-muted-foreground">
                        <Smartphone className="h-4 w-4" />
                        <CreditCard className="h-4 w-4" />
                        <Truck className="h-4 w-4" />
                        <span>bKash · Nagad · Steadfast</span>
                    </div>
                </div>
            )}
        </header>
    )
}
