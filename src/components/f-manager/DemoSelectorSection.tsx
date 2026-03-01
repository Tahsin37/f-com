"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone, Monitor, Sparkles, CheckCircle2, Zap } from "lucide-react"

export function DemoSelectorSection() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    const templates = [
        {
            id: "starter",
            name: "Starter Template",
            subtitle: "Clean & Minimalistic",
            desc: "Perfect for boutique shops. Clean single-column layout, large hero, elegant product cards.",
            icon: Smartphone,
            gradient: "from-violet-500 to-purple-600",
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Centered layout", "Minimal navigation", "Large product images"],
        },
        {
            id: "pro",
            name: "Pro Template",
            subtitle: "Full E-Commerce (Daraz-like)",
            desc: "Everything a real e-commerce site needs. Flash deals, category nav, search, sort, and more.",
            icon: Monitor,
            gradient: "from-teal-500 to-emerald-600",
            image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Sticky nav + search", "Flash deals strip", "5-column grid with sort"],
        },
    ]

    return (
        <section className="py-24 md:py-32 bg-white dark:bg-neutral-950">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center justify-center mb-12 lg:mb-20 gap-6">
                    <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold px-4 py-2 rounded-full">
                        <Sparkles className="h-3.5 w-3.5" /> Two Premium Designs
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Choose Your Store Design
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Pick a template at signup and start selling. You can switch anytime from your dashboard.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {templates.map((t, i) => (
                        <div
                            key={t.id}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="group relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-2xl transition-all"
                        >
                            {/* Image Header */}
                            <div className="relative h-52 overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${t.image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 p-6">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-3 shadow-lg transform transition-transform duration-500 ${hoveredIndex === i ? "-translate-y-1" : ""}`}>
                                        <t.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-white">{t.name}</h3>
                                    <p className="text-white/70 text-sm font-medium">{t.subtitle}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
                                <div className="space-y-2 mb-6">
                                    {t.features.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-xs">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                            <span className="font-medium">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/auth/signup">
                                    <Button className="w-full rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
                                        Use This Template <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link href="/demo">
                        <Button variant="outline" className="rounded-full font-bold h-12 px-8 gap-2">
                            <Zap className="h-4 w-4" /> See Full Demo <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
