"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Smartphone, CreditCard, Truck, ShieldCheck } from "lucide-react"

export function TrustSection() {
    return (
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-black">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                        Locally Trusted. Locally Built.
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Designed specifically for Bangladeshi F-commerce sellers with local payment & courier integrations.
                    </p>
                </div>

                {/* Payment & Courier Trust Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-3xl mx-auto">
                    {[
                        { icon: Smartphone, label: "bKash", sub: "পেমেন্ট" },
                        { icon: CreditCard, label: "Nagad", sub: "পেমেন্ট" },
                        { icon: Truck, label: "Steadfast", sub: "কুরিয়ার" },
                        { icon: ShieldCheck, label: "OTP Verified", sub: "নিরাপত্তা" },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center p-5 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center mb-3">
                                <item.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <span className="font-bold text-sm">{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.sub}</span>
                        </div>
                    ))}
                </div>

                {/* Demo Store CTA */}
                <div className="relative max-w-2xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 p-8 md:p-12 text-white text-center shadow-2xl shadow-teal-600/20">
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIi8+PC9nPjwvc3ZnPg==')]" />
                    <h3 className="text-2xl md:text-3xl font-extrabold mb-3 relative z-10">Try a Live Demo Store</h3>
                    <p className="text-teal-100 mb-6 max-w-lg mx-auto relative z-10">
                        See exactly how your storefront will look. Browse products, add to cart, and experience the full checkout.
                    </p>
                    <Button size="lg" variant="secondary" className="rounded-full font-bold px-8 h-14 text-teal-700 hover:text-teal-800 relative z-10 shadow-lg" asChild>
                        <Link href="/demo/sifr-style">
                            Open Demo Store <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
