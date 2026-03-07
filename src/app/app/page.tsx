"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, Shield, Zap, Smartphone, BarChart3, Bell, Truck, Lock, CheckCircle2, ArrowRight, ChevronDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const features = [
    {
        icon: Smartphone,
        title: "Full Dashboard in Your Pocket",
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

const steps = [
    { num: "1", title: "Download the APK", desc: "Tap the download button below" },
    { num: "2", title: "Install & Open", desc: "Allow install from unknown sources, then open" },
    { num: "3", title: "Sign In", desc: "Your F-Manager account works instantly" },
    { num: "4", title: "Auto Activated", desc: "SMS listener starts automatically in background" },
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
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
            {/* ═══ HERO ═══ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-[140px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-lg">F-Manager</span>
                    </Link>
                    <a href="#download" className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-bold transition-colors">
                        Download APK
                    </a>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 max-w-3xl mt-20" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-8">
                        <Smartphone className="h-3.5 w-3.5" />
                        Android App Available
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
                        Your Store.
                        <br />
                        <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            In Your Pocket.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed">
                        The F-Manager Android app gives you the full power of your dashboard — plus automatic bKash/Nagad payment verification via SMS.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#download" className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-2xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                            <Download className="h-5 w-5" />
                            Download for Android
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        {hasSession ? (
                            <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg transition-all">
                                Go To Dashboard
                            </Link>
                        ) : (
                            <Link href="/auth/signin" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg transition-all">
                                Open Web Version
                            </Link>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-6 mt-10 text-neutral-500 text-sm">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-teal-500" /> Free Download</span>
                        <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-teal-500" /> No Ads</span>
                        <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-teal-500" /> Lightweight</span>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="h-6 w-6 text-neutral-600" />
                </div>
            </section>

            {/* ═══ PHONE MOCKUP + KEY FEATURE ═══ */}
            <section className="py-24 px-6 relative">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
                            Not a Web Wrapper.
                            <br />
                            <span className="text-teal-400">A Real Experience.</span>
                        </h2>
                        <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                            F-Manager runs with a native app icon on your home screen, sticky background service for SMS listening,
                            and full file upload support. It&apos;s everything your web dashboard can do — tailored for mobile.
                        </p>
                        <div className="space-y-4">
                            {[
                                "App icon on home screen — looks like any other app",
                                "Background SMS listener — works even when app is closed",
                                "Camera & gallery access for product image uploads",
                                "Push notifications for new orders",
                                "Works on Android 7.0+ (99% of devices)",
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                                    <span className="text-neutral-300 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        {/* Phone frame */}
                        <div className="relative w-[280px] h-[560px] rounded-[40px] bg-neutral-900 border-4 border-neutral-800 shadow-2xl shadow-teal-500/10 overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-800 rounded-b-2xl z-10" />
                            <div className="w-full h-full bg-[#0a0a0a] p-4 pt-10">
                                {/* Mini dashboard mockup */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-6 w-6 rounded bg-teal-600 flex items-center justify-center">
                                            <BarChart3 className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="text-xs font-bold">F-Manager</span>
                                    </div>
                                    {/* Stats cards */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Today's Sales", val: "৳12,450", color: "bg-teal-900/30 border-teal-800/30" },
                                            { label: "Orders", val: "23", color: "bg-purple-900/30 border-purple-800/30" },
                                            { label: "Pending", val: "5", color: "bg-amber-900/30 border-amber-800/30" },
                                            { label: "Shipped", val: "18", color: "bg-blue-900/30 border-blue-800/30" },
                                        ].map(s => (
                                            <div key={s.label} className={`p-2.5 rounded-xl border ${s.color}`}>
                                                <p className="text-[8px] text-neutral-500">{s.label}</p>
                                                <p className="text-sm font-extrabold mt-0.5">{s.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Revenue chart mockup */}
                                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 mt-2">
                                        <p className="text-[8px] text-neutral-500 mb-2">Revenue (7 days)</p>
                                        <div className="flex items-end gap-1.5 h-12">
                                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-teal-600 to-teal-400" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Order list */}
                                    <div className="space-y-1.5 mt-2">
                                        {[
                                            { name: "Rahim", total: "৳1,200", status: "✅" },
                                            { name: "Karim", total: "৳800", status: "🔄" },
                                            { name: "Sharmin", total: "৳2,100", status: "📦" },
                                        ].map(o => (
                                            <div key={o.name} className="flex items-center justify-between bg-neutral-900/50 border border-neutral-800/50 rounded-lg px-3 py-2">
                                                <div>
                                                    <p className="text-[9px] font-bold">{o.name}</p>
                                                    <p className="text-[8px] text-neutral-500">{o.total}</p>
                                                </div>
                                                <span className="text-xs">{o.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES GRID ═══ */}
            <section className="py-24 px-6 bg-neutral-950/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Everything You Need</h2>
                        <p className="text-neutral-400 text-lg max-w-xl mx-auto">
                            Built specifically for F-Commerce sellers in Bangladesh
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="group p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700 transition-all hover:-translate-y-1">
                                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: f.color + "15" }}>
                                    <f.icon className="h-6 w-6" style={{ color: f.color }} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Setup in 2 Minutes</h2>
                        <p className="text-neutral-400 text-lg">Download → Install → Done. That&apos;s it.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s) => (
                            <div key={s.num} className="text-center">
                                <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-teal-600/10 border border-teal-600/20 flex items-center justify-center text-2xl font-extrabold text-teal-400">
                                    {s.num}
                                </div>
                                <h3 className="text-base font-bold mb-1">{s.title}</h3>
                                <p className="text-sm text-neutral-500">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ DOWNLOAD CTA ═══ */}
            <section id="download" className="py-24 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="p-10 rounded-3xl bg-gradient-to-br from-teal-900/30 via-neutral-900 to-purple-900/20 border border-teal-800/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />
                        <div className="relative z-10">
                            <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                                <Download className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Download F-Manager</h2>
                            <p className="text-neutral-400 mb-8 text-lg">
                                Free • Android 7.0+ • 4MB • No ads
                            </p>
                            <a
                                href="/downloads/f-manager.apk"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl shadow-2xl shadow-teal-500/30 transition-all hover:-translate-y-1 hover:shadow-teal-500/40"
                            >
                                <Download className="h-6 w-6" />
                                Download APK
                            </a>
                            <p className="text-xs text-neutral-600 mt-6">
                                v1.0.0 • Last updated: March 2026
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-8 px-6 border-t border-neutral-800/50">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-bold text-sm">F-Manager</span>
                    </div>
                    <div className="flex gap-6 text-sm text-neutral-500">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        {hasSession ? (
                            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        ) : (
                            <Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link>
                        )}
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                    <p className="text-xs text-neutral-600">© 2026 Team Sifr</p>
                </div>
            </footer>
        </div>
    )
}
