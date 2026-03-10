"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, Shield, Zap, Smartphone, BarChart3, Bell, Truck, Lock, CheckCircle2, ArrowRight, ChevronRight, Star, ArrowUpRight, Upload, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const features = [
    {
        icon: Smartphone,
        title: "Native Mobile Experience",
        desc: "Manage orders, products, couriers — everything from one app. Feels completely native.",
        color: "#0d9488",
    },
    {
        icon: Bell,
        title: "Real-Time Order Alerts",
        desc: "Instant push notifications when a new order comes in. Never miss a sale again.",
        color: "#f59e0b",
    },
    {
        icon: Shield,
        title: "Auto Payment Verification",
        desc: "RuxSpeed listens for bKash/Nagad SMS and auto-verifies payments. Zero manual checking.",
        color: "#8b5cf6",
    },
    {
        icon: Truck,
        title: "1-Click Courier Booking",
        desc: "Book Steadfast parcels instantly. COD amount auto-calculated minus advance.",
        color: "#ec4899",
    },
    {
        icon: Lock,
        title: "Secure & Private",
        desc: "Your data stays on your device. SMS is parsed locally, only TrxID sent to your server.",
        color: "#06b6d4",
    },
    {
        icon: Zap,
        title: "Works Offline",
        desc: "SMS transactions are queued locally and synced when internet is back. Never lose data.",
        color: "#f97316",
    },
]

export default function AppPage() {
    const [scrollY, setScrollY] = useState(0)
    const [hasSession, setHasSession] = useState(false)

    useEffect(() => {
        const handler = () => setScrollY(window.scrollY)
        window.addEventListener("scroll", handler, { passive: true })
        return () => window.removeEventListener("scroll", handler)
    }, [])

    useEffect(() => {
        let mounted = true
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) setHasSession(!!session)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) setHasSession(!!session)
        })
        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#000000] text-[#ededed] font-sans selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">

            {/* ═══ NAVIGATION ═══ */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 20 ? "bg-[#000000]/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-[17px] tracking-tight text-white">F-Manager <span className="text-white/40">App</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {hasSession ? (
                            <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Go to Dashboard</Link>
                        ) : (
                            <Link href="/auth/signin" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Sign In</Link>
                        )}
                        <a href="#download" className="h-10 px-5 flex items-center justify-center rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors drop-shadow-md">
                            Get App
                        </a>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center text-center">
                {/* Abstract Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen' }} />

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-medium mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                        Introducing F-Manager Mobile v2.0
                    </div>

                    <h1 className="text-[3.5rem] md:text-[5.5rem] font-bold leading-[1.05] tracking-[-0.04em] mb-8 transparent-text bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
                        Run your empire.<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500">From your pocket.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-[1.6] tracking-tight font-medium">
                        The definitive operating system for modern F-Commerce. Automatic bKash verification, instant courier booking, and real-time analytics — unified in an impossibly fast native app.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                        <a href="#download" className="group w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white text-black font-semibold text-[15px] hover:scale-105 transition-all duration-300">
                            Download for Android
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <Link href="#features" className="group w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-transparent border border-white/20 text-white font-semibold text-[15px] hover:bg-white/5 transition-all duration-300">
                            Explore Features
                            <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                        </Link>
                    </div>

                    <div className="mt-14 flex items-center justify-center gap-8 text-[#52525b] text-sm font-medium">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600/70" /> 100% Free Setup</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600/70" /> No Hidden Fees</span>
                    </div>
                </div>
            </section>

            {/* ═══ MOCKUP SHOWCASE (Trillion-Dollar Look) ═══ */}
            <section className="relative px-6 pb-40">
                <div className="max-w-[1200px] mx-auto rounded-[40px] border border-white/10 bg-[#0a0a0a] p-4 sm:p-8 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(20,184,166,0.1)]">
                    {/* Inner glowing orb */}
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
                        <div className="space-y-8 order-2 lg:order-1">
                            <div>
                                <h2 className="text-3xl md:text-[2.75rem] font-bold leading-[1.1] tracking-[-0.03em] mb-6">
                                    Native performance.<br />Zero compromises.
                                </h2>
                                <p className="text-[#a1a1aa] text-[17px] leading-relaxed max-w-md">
                                    Designed with painstaking attention to detail, the F-Manager app delivers buttery-smooth 120hz scrolling, instant screen transitions, and background syncing that just works.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Smartphone, title: "Sticky Background Services", desc: "Listens for bKash SMS even when swiped away." },
                                    { icon: Zap, title: "Offline Queueing", desc: "Make changes offline; it syncs the millisecond you reconnect." },
                                    { icon: Lock, title: "On-Device Processing", desc: "SMS parsing happens on your phone, preserving total privacy." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                            <item.icon className="h-5 w-5 text-teal-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold text-[15px] mb-1 tracking-tight">{item.title}</h4>
                                            <p className="text-[#71717a] text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Highly Detailed CSS Phone Mockup */}
                        <div className="order-1 lg:order-2 flex justify-center lg:justify-end perspective-[1000px]">
                            <div className="relative w-[300px] h-[610px] rounded-[48px] bg-black border-[6px] border-[#1f1f1f] shadow-2xl relative z-10 overflow-hidden transform rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-y-[0deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out flex-shrink-0">
                                {/* Dynamic Island / Notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-30" />

                                {/* App Screen */}
                                <div className="w-full h-full bg-[#050505] p-5 pt-12 overflow-hidden flex flex-col relative text-white">
                                    {/* App Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center">
                                                <BarChart3 className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] font-bold leading-tight">Overview</h3>
                                                <p className="text-[10px] text-white/50">My F-Store</p>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center relative">
                                            <Bell className="h-4 w-4 text-white" />
                                            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                                        </div>
                                    </div>

                                    {/* App Content */}
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900/40 to-[#050505] border border-teal-500/20">
                                            <p className="text-[11px] text-teal-200/60 font-medium mb-1 uppercase tracking-wider">Today's Revenue</p>
                                            <h2 className="text-3xl font-bold tracking-tight mb-2">৳45,290</h2>
                                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                                <ArrowUpRight className="h-3 w-3" /> +14.2% vs yesterday
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                                                <p className="text-[10px] text-white/50 mb-1">Orders</p>
                                                <p className="text-lg font-bold">128</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                                                <p className="text-[10px] text-white/50 mb-1">Pending Shipping</p>
                                                <p className="text-lg font-bold text-amber-400">24</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-[12px] font-bold">Recent Orders</h4>
                                                <span className="text-[10px] text-teal-400">View All</span>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { id: "#2394", name: "Faisal Ahmed", amt: "৳2,400", time: "2m ago", status: "Paid" },
                                                    { id: "#2393", name: "Sara Khan", amt: "৳1,150", time: "15m ago", status: "COD" },
                                                    { id: "#2392", name: "Rafiq H.", amt: "৳4,990", time: "1h ago", status: "Paid" }
                                                ].map((o, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                                {o.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-semibold">{o.name}</p>
                                                                <p className="text-[9px] text-white/50">{o.id} • {o.time}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[11px] font-bold">{o.amt}</p>
                                                            <p className={`text-[9px] font-semibold ${o.status === "Paid" ? "text-emerald-400" : "text-amber-400"}`}>{o.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* App Bottom Nav */}
                                    <div className="absolute bottom-4 left-4 right-4 h-14 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around px-2 z-20">
                                        <div className="flex flex-col items-center gap-1 opacity-100"><BarChart3 className="h-5 w-5 text-teal-400" /></div>
                                        <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"><Truck className="h-5 w-5" /></div>
                                        <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]"><Upload className="h-5 w-5" /></div>
                                        <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"><Zap className="h-5 w-5" /></div>
                                        <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"><Store className="h-5 w-5" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ BENTO GRID FEATURES ═══ */}
            <section id="features" className="py-24 px-6 overflow-hidden">
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">A complete ecosystem.</h2>
                        <p className="text-[#a1a1aa] text-lg max-w-xl">Every tool you need to scale your F-Commerce business effortlessly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
                        {/* Bento Item 1 */}
                        <div className="md:col-span-2 p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.1)_0%,transparent_50%)]" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
                                    <Smartphone className="h-6 w-6 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">True Native Experience</h3>
                                    <p className="text-[#a1a1aa]">Not merely a web-wrapper. Written to take full advantage of your device's hardware for fluid, 120fps navigation and instant loads.</p>
                                </div>
                            </div>
                        </div>

                        {/* Bento Item 2 */}
                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(236,72,153,0.1)_0%,transparent_50%)]" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                                    <Truck className="h-6 w-6 text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">1-Click Booking</h3>
                                    <p className="text-[#a1a1aa] text-sm md:text-base">Push consignments straight to Steadfast with a single tap.</p>
                                </div>
                            </div>
                        </div>

                        {/* Bento Item 3 */}
                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.1)_0%,transparent_50%)]" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                                    <Bell className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Push Alerts</h3>
                                    <p className="text-[#a1a1aa] text-sm md:text-base">Instant notifications whenever a sale lands. Keep your finger on the pulse.</p>
                                </div>
                            </div>
                        </div>

                        {/* Bento Item 4 */}
                        <div className="md:col-span-2 p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                                    <Shield className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Invisible Payment Verification</h3>
                                    <p className="text-[#a1a1aa]">Our proprietary RuxSpeed engine listens for payment SMS texts locally, correlates the TrxID with orders, and auto-verifies. Magic.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ DEEP DIVE ANIMATED SECTIONS ═══ */}
            <section className="py-24 px-6">
                <div className="max-w-[1200px] mx-auto space-y-32">
                    {/* Feature 1 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
                                Order Management
                            </div>
                            <h2 className="text-3xl md:text-[2.5rem] font-bold leading-tight tracking-[-0.03em]">Every order detail, <br />instantly accessible.</h2>
                            <p className="text-[#a1a1aa] text-lg leading-relaxed">View customer details, shipping addresses, and order history in milliseconds. The native app caches data intelligently so you never stare at a loading spinner when you need information fast.</p>
                            <ul className="space-y-4 pt-4">
                                {["One-tap customer calling", "Instant WhatsApp integration", "Detailed timeline of order events"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                                        <CheckCircle2 className="h-5 w-5 text-teal-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 relative group perspective-[1000px]">
                            <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full group-hover:bg-teal-500/30 transition-colors duration-500" />
                            <div className="relative rounded-[32px] border border-white/10 bg-[#111] p-6 shadow-2xl transform transition-transform duration-700 hover:rotate-y-[5deg] hover:rotate-x-[2deg]">
                                <div className="space-y-4">
                                    <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse delay-75"></div>
                                    <div className="h-24 w-full bg-white/5 rounded-2xl animate-pulse delay-150"></div>
                                    <div className="h-16 w-full bg-white/5 rounded-2xl animate-pulse delay-300"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative group perspective-[1000px]">
                            <div className="absolute inset-0 bg-pink-500/20 blur-[100px] rounded-full group-hover:bg-pink-500/30 transition-colors duration-500" />
                            <div className="relative rounded-[32px] border border-white/10 bg-[#111] p-6 shadow-2xl transform transition-transform duration-700 hover:rotate-y-[-5deg] hover:rotate-x-[2deg]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 w-full bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/20 rounded-2xl"></div>
                                    <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
                                    <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
                                    <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider">
                                Shipping & Logistics
                            </div>
                            <h2 className="text-3xl md:text-[2.5rem] font-bold leading-tight tracking-[-0.03em]">Ship faster than <br />humanly possible.</h2>
                            <p className="text-[#a1a1aa] text-lg leading-relaxed">Integrated directly with Pathao and Steadfast. F-Manager calculates the exact COD amount minus any advance payments and pushes the consignment to the courier in a single tap.</p>
                            <ul className="space-y-4 pt-4">
                                {["Auto COD calculations", "Bulk order pushing", "Live tracking status updates"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                                        <CheckCircle2 className="h-5 w-5 text-pink-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ HOW TO GET STARTED ═══ */}
            <section className="py-24 px-6 bg-[#050505] border-t border-white/5">
                <div className="max-w-[1200px] mx-auto text-center">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">3 Steps to Freedom.</h2>
                        <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto">Get up and running with the mobile app in under two minutes.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-teal-500/0 via-teal-500/30 to-teal-500/0 z-0"></div>

                        {[
                            { step: "1", title: "Download", desc: "Get the F-Manager APK directly from our secure servers." },
                            { step: "2", title: "Sign In", desc: "Log in with your existing F-Manager credentials." },
                            { step: "3", title: "Grant Permissions", desc: "Allow SMS access for the RuxSpeed auto-verification engine." }
                        ].map((s, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full bg-black border-[4px] border-[#050505] shadow-[0_0_0_2px_rgba(20,184,166,0.5)] flex items-center justify-center text-xl font-bold text-teal-400 mb-6 bg-[#0a0a0a]">
                                    {s.step}
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-white">{s.title}</h4>
                                <p className="text-[#a1a1aa] leading-relaxed text-sm max-w-[250px]">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA SECTION ═══ */}
            <section id="download" className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-[3rem] md:text-[4.5rem] font-bold tracking-[-0.04em] leading-[1.05] mb-6">
                        Ready to elevate?
                    </h2>
                    <p className="text-xl text-[#a1a1aa] mb-10 max-w-xl mx-auto">
                        Download the APK today and dramatically accelerate your workflow. Free forever for F-Manager users.
                    </p>
                    <a
                        href="/downloads/f-manager.apk"
                        className="inline-flex items-center justify-center gap-3 h-16 px-10 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-all duration-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        <Download className="h-5 w-5" />
                        Download F-Manager v2.0
                    </a>
                    <p className="text-[#52525b] text-sm mt-6 font-medium">Requires Android 7.0 or higher. 4MB Download.</p>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-12 px-6 border-t border-white/5 text-[#71717a]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/10">
                            <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-white">F-Manager</span>
                    </div>
                    <div className="flex gap-6 text-[13px] font-medium">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        {hasSession ? (
                            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        ) : (
                            <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
                        )}
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Legal</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
