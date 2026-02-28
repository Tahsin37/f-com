"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    ArrowRight,
    BarChart3,
    ShieldCheck,
    Truck,
    Zap,
    Smartphone,
    Box,
    Users,
    Settings2,
    CreditCard,
    TrendingUp,
    Package,
} from "lucide-react"

const featurePills = [
    { icon: Smartphone, label: "Live Storefront" },
    { icon: ShieldCheck, label: "OTP Verification" },
    { icon: Truck, label: "Courier Booking" },
    { icon: CreditCard, label: "bKash / Nagad" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Users, label: "CRM" },
    { icon: Box, label: "Inventory" },
    { icon: Zap, label: "Automation" },
    { icon: Settings2, label: "API Ready" },
]

const stats = [
    { icon: TrendingUp, value: "80%", label: "Fewer Fake Orders" },
    { icon: Package, value: "1-Click", label: "Courier Booking" },
    { icon: Zap, value: "5 min", label: "Store Setup" },
]

export function Hero() {
    return (
        <div className="relative overflow-hidden bg-slate-50 dark:bg-black pt-24 pb-20 lg:pt-36 lg:pb-36">
            {/* Background Ornaments */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/3 -left-48 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Live Badge */}
                    <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse mr-2"></span>
                        F-Manager 2.0 is Live — Bangladesh&apos;s #1 F-commerce SaaS
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
                        Sell on Social Media{" "}
                        <br className="hidden sm:block" />
                        <span className="text-gradient">Without the Chaos.</span>
                    </h1>

                    {/* Sub-text EN */}
                    <p className="text-lg md:text-xl text-muted-foreground mb-3 max-w-2xl">
                        F-Manager automates your Facebook & Instagram sales — verified checkout, 1-click courier bookings, and real-time analytics. All in one place.
                    </p>

                    {/* Sub-text BN */}
                    <p className="text-sm font-bn text-teal-700/80 dark:text-teal-400/80 mb-10 max-w-xl">
                        ফেসবুক ও ইনস্টাগ্রামে বিক্রি—কোনো প্রযুক্তি ঝামেলা নেই, ১-ক্লিকে পার্সেল বুকিং।
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-14">
                        <Button
                            size="lg"
                            className="h-14 px-10 rounded-full font-bold text-base bg-teal-600 hover:bg-teal-700 text-white shadow-[0_8px_40px_rgba(14,165,164,0.4)] w-full sm:w-auto transition-all hover:-translate-y-1 hover:shadow-[0_12px_50px_rgba(14,165,164,0.5)]"
                            asChild
                        >
                            <Link href="/demo/sifr-style">
                                Start Free Demo <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-10 rounded-full font-bold text-base w-full sm:w-auto neo-card neo-card-hover border-transparent"
                            asChild
                        >
                            <Link href="/auth/signin">View Pricing</Link>
                        </Button>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 w-full">
                        {stats.map((s) => (
                            <div key={s.label} className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <s.icon className="h-5 w-5 text-teal-500" />
                                    <span className="text-3xl font-extrabold text-foreground">{s.value}</span>
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Feature Pills Grid */}
                    <div className="w-full max-w-3xl mx-auto">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                            Everything included in one platform
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {featurePills.map((pill) => (
                                <div
                                    key={pill.label}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-full neo-card neo-card-hover border border-neutral-200/80 dark:border-neutral-700/50 text-sm font-semibold text-foreground group cursor-default"
                                >
                                    <div className="h-6 w-6 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                                        <pill.icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    {pill.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Proof Strip */}
                    <div className="mt-14 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                        <div className="flex -space-x-2">
                            {["S", "I", "N", "R", "T"].map((initial, i) => (
                                <div
                                    key={i}
                                    className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 border-2 border-white dark:border-black flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300"
                                >
                                    {initial}
                                </div>
                            ))}
                        </div>
                        <span>
                            <strong className="text-foreground">100+ sellers</strong> across Bangladesh trust F-Manager
                        </span>
                    </div>

                </div>
            </div>
        </div>
    )
}
