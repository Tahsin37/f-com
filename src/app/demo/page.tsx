"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/f-manager/Header"
import { Footer } from "@/components/f-manager/Footer"
import { Button } from "@/components/ui/button"
import {
    Play, ArrowRight, ShoppingBag, Layout, Zap,
    UserPlus, Package, Store, Share2, CheckCircle2,
    Sparkles, Monitor, Smartphone
} from "lucide-react"

const STEPS = [
    { icon: UserPlus, title: "Create Account", desc: "Sign up free — just your name, email, and store name." },
    { icon: Package, title: "Add Products", desc: "Upload images, set prices, variants, and categories." },
    { icon: Store, title: "Choose Template", desc: "Pick Starter (minimal) or Pro (full e-commerce) design." },
    { icon: Share2, title: "Share & Sell", desc: "Share your store link on Facebook, Instagram, or anywhere." },
]

const TEMPLATES = [
    {
        id: "starter",
        name: "Starter",
        subtitle: "Clean & Minimalistic",
        desc: "Perfect for boutique shops and single-category sellers. Clean layout, big product images, smooth animations.",
        icon: Smartphone,
        gradient: "from-violet-500 to-purple-600",
        features: ["Single-column layout", "Large hero image", "Elegant product cards", "Smooth animations", "Minimal footer"],
        preview: "/store/sifr-style",
    },
    {
        id: "pro",
        name: "Pro",
        subtitle: "Full E-Commerce",
        desc: "Daraz-level storefront for multi-category, high-volume sellers. Everything a real e-commerce site needs.",
        icon: Monitor,
        gradient: "from-teal-500 to-emerald-600",
        features: ["Sticky nav + search bar", "Category navigation", "Flash deals strip", "5-column grid", "Sort & filter", "Star ratings"],
        preview: "/store/sifr-style",
    },
]

export default function DemoPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-black">
            <Header />

            {/* Hero */}
            <section className="relative py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-teal-950/30 dark:via-black dark:to-indigo-950/20" />
                <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-teal-200/20 blur-3xl" />
                <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-indigo-200/15 blur-3xl" />

                <div className="container px-4 md:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
                        <Play className="h-3.5 w-3.5" /> See F-Manager in Action
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 max-w-3xl mx-auto leading-tight">
                        Build Your <span className="text-teal-600 dark:text-teal-400">Dream Store</span> in Minutes
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Watch how sellers go from zero to a live storefront in under 5 minutes.
                        Choose your design, add products, and start selling.
                    </p>

                    {/* Video Embed Placeholder */}
                    <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-black aspect-video flex items-center justify-center relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 to-indigo-600/20" />
                        <div className="relative z-10 text-center">
                            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                <Play className="h-8 w-8 text-white fill-white" />
                            </div>
                            <p className="text-white/80 text-sm font-medium">Watch Demo Video (Coming Soon)</p>
                            <p className="text-white/50 text-xs mt-1">See how to get your Steadfast API, add products, and go live</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 md:py-24 bg-neutral-50 dark:bg-neutral-950">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How It Works</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">Four simple steps to launch your online store</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {STEPS.map((step, i) => (
                            <div key={step.title} className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-teal-600 text-white text-xs font-extrabold flex items-center justify-center shadow-lg">
                                    {i + 1}
                                </div>
                                <step.icon className="h-8 w-8 text-teal-600 mb-4" />
                                <h3 className="font-bold text-sm mb-2">{step.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Template Previews */}
            <section className="py-20 md:py-28">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-4">
                            <Layout className="h-3.5 w-3.5" /> Choose Your Design
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Two Premium Templates</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Pick the design that fits your brand. You can always switch later from your dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {TEMPLATES.map(t => (
                            <div key={t.id} className="group bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all">
                                {/* Gradient Header */}
                                <div className={`bg-gradient-to-br ${t.gradient} p-8 text-white relative overflow-hidden`}>
                                    <div className="absolute top-4 right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                                    <t.icon className="h-10 w-10 mb-4 relative z-10" />
                                    <h3 className="text-2xl font-extrabold relative z-10">{t.name}</h3>
                                    <p className="text-white/80 text-sm font-medium relative z-10">{t.subtitle}</p>
                                </div>

                                <div className="p-6">
                                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{t.desc}</p>
                                    <div className="space-y-2 mb-6">
                                        {t.features.map(f => (
                                            <div key={f} className="flex items-center gap-2 text-xs">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                                <span className="text-foreground font-medium">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <Link href={t.preview} target="_blank" className="flex-1">
                                            <Button variant="outline" className="w-full rounded-xl text-xs font-bold gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5" /> Preview
                                            </Button>
                                        </Link>
                                        <Link href="/auth/signup" className="flex-1">
                                            <Button className="w-full rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
                                                Use This <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-teal-600 to-emerald-700 text-white text-center">
                <div className="container px-4">
                    <Zap className="h-10 w-10 mx-auto mb-5 fill-white" />
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Launch?</h2>
                    <p className="text-teal-100 max-w-md mx-auto mb-8">
                        Create your free store in under 5 minutes. No credit card. No coding.
                    </p>
                    <Link href="/auth/signup">
                        <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-extrabold rounded-full px-8 shadow-xl">
                            Create Your Free Store <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}
