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

            {/* Customizability Showcase */}
            <section className="py-20 md:py-28">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-4">
                            <Sparkles className="h-3.5 w-3.5" /> Infinite Customizability
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Your Brand, Your Rules</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Design a storefront that perfectly matches your brand identity. F-Manager gives you complete control over every pixel without writing a single line of code.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
                        {/* Left Side: Visual/UI Representation */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100 dark:bg-neutral-900 aspect-[4/3] group">
                            {/* Decorative background gradients */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                            <div className="absolute inset-x-8 top-8 bottom-0 bg-white dark:bg-[#0a0a0a] rounded-t-2xl shadow-xl border border-b-0 border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col transition-transform duration-500 group-hover:-translate-y-2">
                                {/* Mockup Header */}
                                <div className="h-10 border-b border-neutral-100 dark:border-neutral-800 flex items-center px-4 gap-2 bg-slate-50 dark:bg-neutral-900/50">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                </div>
                                {/* Mockup Content */}
                                <div className="p-6 space-y-4 flex-1 bg-gradient-to-b from-white to-slate-50 dark:from-[#0a0a0a] dark:to-neutral-950">
                                    <div className="h-8 w-full bg-teal-600/10 rounded-lg flex items-center px-4">
                                        <div className="h-2 w-24 bg-teal-600 rounded-full" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-24 w-1/3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl" />
                                        <div className="h-24 w-1/3 bg-slate-100 dark:bg-neutral-800/50 rounded-xl" />
                                        <div className="h-24 w-1/3 bg-slate-100 dark:bg-neutral-800/50 rounded-xl" />
                                    </div>
                                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-4" />
                                    <div className="h-4 w-1/2 bg-neutral-100 dark:bg-neutral-800/50 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Features List */}
                        <div className="space-y-8">
                            {[
                                { title: "Theme Colors & Branding", desc: "Select your primary HEX color and we automatically generate a beautiful, accessible color palette for your entire store.", icon: Layout, color: "text-blue-500", bg: "bg-blue-500/10" },
                                { title: "Dynamic Hero Sliders", desc: "Upload promotional banners, announce flash sales with countdowns, and set custom call-to-action buttons.", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
                                { title: "Smart Announcement Bars", desc: "Highlight free shipping thresholds or coupon codes globally across the top of every page.", icon: Zap, color: "text-teal-500", bg: "bg-teal-500/10" },
                                { title: "Custom Social Footers", desc: "Link your Facebook page, Instagram profile, and establish trust with embedded contact information.", icon: Share2, color: "text-purple-500", bg: "bg-purple-500/10" },
                            ].map((feat, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${feat.bg} ${feat.color}`}>
                                        <feat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{feat.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4">
                                <Link href="/auth/signup">
                                    <Button className="rounded-xl font-bold px-8 h-12 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                        Customize Your Store <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
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
