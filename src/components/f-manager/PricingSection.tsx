"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

    return (
        <section className="py-24 md:py-32 bg-slate-50 dark:bg-black">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        Start for free. Upgrade to Pro when you need advanced logistics & payment automation.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center p-1 bg-white dark:bg-neutral-900 rounded-full border shadow-sm">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === "monthly"
                                ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${billingCycle === "yearly"
                                ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Yearly
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${billingCycle === "yearly" ? "bg-white/20 text-white" : "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
                                }`}>
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">

                    {/* Free Plan */}
                    <Card className="rounded-[2rem] border-2 border-neutral-200 dark:border-neutral-800 shadow-xl dark:bg-neutral-900 p-2 relative h-fit hover:-translate-y-1 transition-transform duration-300">
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8">
                            <CardHeader className="p-0 pb-6">
                                <CardTitle className="text-2xl font-bold">Starter Plan</CardTitle>
                                <CardDescription className="text-base mt-2">Perfect for side-hustles</CardDescription>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-5xl font-extrabold tracking-tight">৳0</span>
                                    <span className="text-muted-foreground ml-2 font-medium">/forever</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 space-y-4">
                                {[
                                    "Ready-made storefront (subdomain)",
                                    "Up to 20 products",
                                    "OTP verified checkout",
                                    "Cash on Delivery support",
                                    "Basic analytics dashboard",
                                ].map((f) => (
                                    <div key={f} className="flex items-center gap-3 text-sm font-medium justify-center">
                                        <Check className="h-5 w-5 text-teal-500 shrink-0" />
                                        <span className="text-muted-foreground">{f}</span>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-8 rounded-2xl h-14 font-bold text-base border-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" asChild>
                                    <Link href="/auth/signin">Get Started Free</Link>
                                </Button>
                            </CardContent>
                        </div>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="neo-card rounded-[2rem] border-transparent p-2 relative shadow-2xl shadow-teal-500/10 hover:-translate-y-2 transition-transform duration-300 z-10">
                        {/* Animated glowing border effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-teal-600 to-teal-900 rounded-[2rem] opacity-30 blur-md pointer-events-none" />

                        <div className="relative bg-slate-900 dark:bg-black rounded-3xl p-6 md:p-10 text-white overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-500 to-teal-400 text-white text-xs font-bold px-6 py-2 rounded-bl-2xl shadow-lg">
                                MOST POPULAR
                            </div>
                            <CardHeader className="p-0 pb-6">
                                <CardTitle className="text-2xl font-bold">Professional</CardTitle>
                                <CardDescription className="text-teal-100/70 text-base mt-2">For growing F-commerce sellers</CardDescription>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-5xl font-extrabold tracking-tight">
                                        ৳{billingCycle === "monthly" ? "499" : "399"}
                                    </span>
                                    <span className="text-teal-100/70 ml-2 font-medium">/month</span>
                                </div>
                                {billingCycle === "yearly" && (
                                    <div className="text-xs font-bold text-teal-400 mt-2 uppercase tracking-wide">
                                        Billed ৳4,788 annually
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0 space-y-4">
                                {[
                                    "Everything in Starter",
                                    "Unlimited products & orders",
                                    "1-Click Steadfast & Pathao booking",
                                    "bKash/Nagad Auto Verification",
                                    "Mini-POS for offline sales",
                                    "Blacklist database access",
                                    "Priority WhatsApp Support",
                                ].map((f) => (
                                    <div key={f} className="flex items-center gap-3 text-sm font-medium justify-center">
                                        <Check className="h-5 w-5 text-teal-400 shrink-0" />
                                        <span className="text-slate-200">{f}</span>
                                    </div>
                                ))}
                                <Button className="w-full mt-8 rounded-2xl h-14 font-bold text-base bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-lg transition-transform hover:scale-[1.02]" asChild>
                                    <Link href="/auth/signin">Start 14-Day Pro Trial</Link>
                                </Button>
                            </CardContent>
                        </div>
                    </Card>

                </div>
            </div>
        </section>
    )
}
