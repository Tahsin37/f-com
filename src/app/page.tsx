"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, Zap, Smartphone, BarChart3, Truck, Store, Palette, ArrowRight, ChevronRight, CheckCircle2, ShoppingCart, Globe, ChevronDown, User, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [hasSession, setHasSession] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-white">F-Manager</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#features" className="text-white/70 hover:text-white transition-colors">Features</Link>
              <Link href="/app" className="text-white/70 hover:text-white transition-colors">Mobile App</Link>
            </div>

            <div className="flex items-center gap-4">
              {hasSession ? (
                <Link href="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Go to Dashboard</Link>
              ) : (
                <Link href="/auth/signin" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Sign In</Link>
              )}
              <Link href="/auth/signup" className="h-10 px-5 flex items-center justify-center rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors drop-shadow-md">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-40 md:pt-48 pb-32 px-6 flex flex-col items-center justify-center text-center">
        {/* Abstract Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen' }} />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-medium mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            The ultimate F-Commerce platform
          </div>

          <h1 className="text-[3.5rem] md:text-[6rem] font-bold leading-[1.05] tracking-[-0.04em] mb-8 transparent-text bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            Launch your empire.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500">For zero cost.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-[1.6] tracking-tight font-medium">
            Create a premium online store in seconds. Manage inventory, automate courier shipments, and process payments—all from one unified, blisteringly fast dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link href="/auth/signup" className="group w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white text-black font-semibold text-[15px] hover:scale-105 transition-all duration-300">
              Create Your Store
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/app" className="group w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-transparent border border-white/20 text-white font-semibold text-[15px] hover:bg-white/5 transition-all duration-300">
              Download Mobile App
              <Smartphone className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
            </Link>
          </div>

          <div className="mt-14 flex items-center justify-center gap-8 text-[#52525b] text-sm font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600/70" /> No Monthly Subscriptions</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600/70" /> Setup in 60s</span>
          </div>
        </div>
      </section>

      {/* ═══ MOCKUP SHOWCASE ═══ */}
      <section className="relative px-6 pb-40">
        <div className="max-w-[1200px] mx-auto rounded-[40px] border border-white/10 bg-[#0a0a0a] p-4 sm:p-8 relative overflow-hidden shadow-[0_0_100px_rgba(20,184,166,0.1)]">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full rounded-2xl md:rounded-[32px] border border-white/10 bg-black overflow-hidden shadow-2xl">
            {/* Fake Browser Chrome */}
            <div className="h-12 border-b border-white/10 bg-[#111] flex items-center px-4 gap-4">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/50"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500/50"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500/50"></span>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-7 w-full max-w-sm rounded-[6px] bg-white/5 mx-auto flex items-center justify-center text-[11px] text-white/30 tracking-widest font-mono">dashboard.f-manager.com</div>
              </div>
            </div>
            {/* Fake Dashboard Body */}
            <div className="flex h-[400px] md:h-[600px] bg-[#050505]">
              {/* Sidebar Mock */}
              <div className="w-16 md:w-64 border-r border-white/5 bg-[#0a0a0a] p-4 flex flex-col gap-4">
                <div className="h-8 w-full rounded bg-white/10 mb-4"></div>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`h-8 rounded md:w-full ${i === 1 ? 'bg-teal-500/20 w-8 md:w-full' : 'bg-white/5 w-8 md:w-3/4'}`}></div>
                ))}
              </div>
              {/* Main Content Mock */}
              <div className="flex-1 p-6 md:p-10 overflow-hidden flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/20 rounded"></div>
                    <div className="h-8 w-48 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-10 w-32 bg-teal-500/80 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
                    <div className="h-4 w-20 bg-white/10 rounded"></div>
                    <div className="h-8 w-32 bg-white/20 rounded"></div>
                  </div>
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
                    <div className="h-4 w-20 bg-white/10 rounded"></div>
                    <div className="h-8 w-32 bg-teal-400/80 rounded"></div>
                  </div>
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col justify-between">
                    <div className="h-4 w-20 bg-white/10 rounded"></div>
                    <div className="h-8 w-32 bg-white/20 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl border border-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENTO GRID FEATURES ═══ */}
      <section id="features" className="py-24 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">Everything to run a store.</h2>
            <p className="text-[#a1a1aa] text-lg max-w-xl">A complete ecosystem designed to turn operations into an afterthought.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
            {/* Bento Item 1 */}
            <div className="md:col-span-2 p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
                  <Store className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Instant Storefront</h3>
                  <p className="text-[#a1a1aa]">Get a premium, high-converting E-Commerce website out of the box. Zero coding. Perfect mobile responsiveness.</p>
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
                  <h3 className="text-xl font-bold mb-2">Automated Shipping</h3>
                  <p className="text-[#a1a1aa] text-sm md:text-base">Integrated directly with Pathao and Steadfast. Push orders instantly.</p>
                </div>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Palette className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Theme Studio AI</h3>
                  <p className="text-[#a1a1aa] text-sm md:text-base">Use AI to redesign your entire store in one click. Prompt your perfect look.</p>
                </div>
              </div>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-2 p-8 rounded-[32px] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Custom Subdomains</h3>
                  <p className="text-[#a1a1aa]">Get a professional `mystore.f-manager.com` domain instantly. Give your brand the prestige it deserves.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">Go live in minutes.</h2>
            <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto">Skip the developers and the hosting fees. Just sign up and start selling.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with your store name and details. No credit card required." },
              { step: "02", title: "Add Products", desc: "Upload product images, set prices, and manage inventory easily." },
              { step: "03", title: "Customize Theme", desc: "Use the Theme Studio AI to generate a stunning design in 1 click." },
              { step: "04", title: "Start Selling", desc: "Share your custom link and watch orders flow into your dashboard." }
            ].map((s, i) => (
              <div key={i} className="relative group">
                <div className="text-[4rem] font-black text-white/5 absolute -top-10 -left-4 group-hover:-translate-y-2 transition-transform duration-500">{s.step}</div>
                <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-colors h-full">
                  <h4 className="text-xl font-bold mb-3 text-white">{s.title}</h4>
                  <p className="text-[#a1a1aa] leading-relaxed text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">Loved by top sellers.</h2>
            <p className="text-[#a1a1aa] text-lg max-w-xl">Don't just take our word for it. See what others are saying.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rafiq H.", role: "Founder, Zara's Closet", text: "F-Manager completely changed how I run my f-commerce business. The Steadfast courier integration alone saves me hours every week." },
              { name: "Nusrat Jahan", role: "Owner, TechGadget BD", text: "The premium storefront makes my brand look like a million bucks. And it is completely free. Unbelievable value." },
              { name: "Faisal A.", role: "CEO, Organic Foods", text: "Setting up a custom domain and receiving OTP verified orders has stopped fake orders completely. I love this platform." }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-[32px] bg-[#111] border border-white/5 shadow-xl hover:shadow-teal-500/5 transition-shadow flex flex-col h-full">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 text-emerald-400 fill-emerald-400" />)}
                </div>
                <p className="text-white/80 leading-relaxed mx-auto italic mb-auto flex-1 text-[15px]">"{t.text}"</p>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-500/5 flex items-center justify-center border border-teal-500/20">
                    <User className="h-4 w-4 text-teal-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">{t.name}</h5>
                    <p className="text-xs text-[#a1a1aa]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4">Frequently Asked.</h2>
            <p className="text-[#a1a1aa] text-lg">Everything you need to know about the platform.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Yes. Our core features including the storefront, dashboard, and basic integrations are 100% free with no monthly subscription." },
              { q: "Do I need technical knowledge to set this up?", a: "Not at all. If you know how to use a smartphone, you can set up a store on F-Manager. The Theme Studio AI does all the heavy lifting for design." },
              { q: "Can I use my own custom domain?", a: "Yes. We offer free custom subdomains (e.g., mystore.f-manager.com) instantly. You can also connect your own custom domain easily." },
              { q: "How do the courier integrations work?", a: "We directly integrate with Pathao and Steadfast. Once an order is placed, you can push it to their system with a single click from the dashboard. The COD amount is automatically calculated." },
              { q: "Are there any hidden transaction fees?", a: "No. We don't take a cut of your sales. You only pay standard gateway or courier charges directly to them." }
            ].map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-lg text-white">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-white/50 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 border-t border-white/5' : 'max-h-0'}`}
                >
                  <p className="p-6 text-[#a1a1aa] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[3rem] md:text-[4.5rem] font-bold tracking-[-0.04em] leading-[1.05] mb-6">
            Start your journey.
          </h2>
          <p className="text-xl text-[#a1a1aa] mb-10 max-w-xl mx-auto">
            Join the next generation of sellers who are scaling their businesses without the technical headache.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-3 h-16 px-10 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-all duration-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Create Free Store
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6 border-t border-white/5 text-[#71717a]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/10">
              <Store className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-sm text-white">F-Manager</span>
          </div>
          <div className="flex gap-6 text-[13px] font-medium">
            <Link href="/app" className="hover:text-white transition-colors">Mobile App</Link>
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
