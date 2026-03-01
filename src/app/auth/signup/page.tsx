"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BarChart3, Eye, EyeOff, ArrowRight, ShieldCheck, Truck, Smartphone, Loader2, Monitor, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

const TEMPLATES = [
    {
        id: "starter",
        name: "Starter",
        desc: "Clean & minimal — perfect for boutique shops",
        icon: Smartphone,
        gradient: "from-violet-500 to-purple-600",
    },
    {
        id: "pro",
        name: "Pro",
        desc: "Full e-commerce — Daraz-like with flash deals & search",
        icon: Monitor,
        gradient: "from-teal-500 to-emerald-600",
    },
]

export default function SignUpPage() {
    const [form, setForm] = useState({ name: "", storeName: "", phone: "", email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [template, setTemplate] = useState("pro")
    const router = useRouter()

    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!agreed) { toast.error("Please accept the Terms of Service"); return }
        if (!form.name || !form.storeName || !form.email || !form.password) {
            toast.error("Please fill in all required fields")
            return
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: { full_name: form.name, phone: form.phone }
                }
            })
            if (authError) throw authError
            if (!authData.user) throw new Error("No user returned")

            const rawSlug = form.storeName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
            const slug = rawSlug

            const { error: sellerError } = await supabase.from("sellers").insert({
                user_id: authData.user.id,
                name: form.storeName,
                slug,
                phone: form.phone,
                email: form.email,
                plan: "free",
                settings: {
                    store_template: template,
                    store_tagline: "Best quality products with fast delivery! 🇧🇩",
                    theme_color: "#0d9488",
                    banner_title: `${form.storeName} — New Arrivals`,
                    banner_subtitle: "Free delivery on orders above ৳999",
                    banner_cta: "Shop Now",
                    banner_image: "",
                    delivery_inside: 60,
                    delivery_outside: 120,
                }
            })
            if (sellerError) throw sellerError

            toast.success("Account created! Welcome to F-Manager 🎉")
            router.push("/dashboard")
        } catch (err: any) {
            toast.error(err.message || "Failed to create account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex">
            {/* Left: Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-neutral-950 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />

                <Link href="/" className="flex items-center gap-2 relative z-10">
                    <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-extrabold text-xl text-white">F-Manager</span>
                </Link>

                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
                        Start selling smarter <br />
                        <span className="text-teal-400">in 5 minutes.</span>
                    </h2>
                    <div className="space-y-4 mb-8">
                        {[
                            { icon: Smartphone, text: "Free storefront on your subdomain" },
                            { icon: ShieldCheck, text: "OTP checkout — no fake orders" },
                            { icon: Truck, text: "1-click Steadfast courier booking" },
                        ].map((item) => (
                            <div key={item.text} className="flex items-center gap-3 text-slate-300">
                                <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                                    <item.icon className="h-4 w-4 text-teal-400" />
                                </div>
                                <span className="text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-teal-950/50 border border-teal-800/50 rounded-2xl p-5">
                        <p className="text-teal-300 text-sm font-semibold mb-1">✨ Free Plan Includes:</p>
                        <ul className="text-slate-400 text-xs space-y-1">
                            <li>✓ Up to 20 products</li>
                            <li>✓ OTP verified checkout</li>
                            <li>✓ Basic analytics</li>
                            <li>✓ No credit card needed</li>
                        </ul>
                    </div>
                </div>

                <p className="text-slate-500 text-sm relative z-10">© 2026 F-Manager by Team Sifr</p>
            </div>

            {/* Right: Sign Up Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto">
                <div className="w-full max-w-md">
                    <Link href="/" className="flex lg:hidden items-center gap-2 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-xl text-teal-600 dark:text-teal-400">F-Manager</span>
                    </Link>

                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold text-foreground mb-1">Create your account</h1>
                        <p className="text-sm text-muted-foreground">Start managing your F-commerce sales today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div className="grid sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="font-semibold text-xs">Your Name <span className="text-destructive">*</span></Label>
                                <Input id="name" placeholder="Sabrina Rahman" value={form.name} onChange={e => update("name", e.target.value)}
                                    className="h-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="storeName" className="font-semibold text-xs">Store Name <span className="text-destructive">*</span></Label>
                                <Input id="storeName" placeholder="Zara's Closet" value={form.storeName} onChange={e => update("storeName", e.target.value)}
                                    className="h-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm" />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="font-semibold text-xs">Phone</Label>
                                <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => update("phone", e.target.value)}
                                    className="h-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="font-semibold text-xs">Email <span className="text-destructive">*</span></Label>
                                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)}
                                    className="h-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="font-semibold text-xs">Password <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={e => update("password", e.target.value)}
                                    className="h-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 pr-10 text-sm" />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div className="space-y-2 pt-1">
                            <Label className="font-semibold text-xs">Choose Your Store Design</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTemplate(t.id)}
                                        className={`relative rounded-xl border-2 p-3 text-left transition-all ${template === t.id
                                            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30 shadow-md"
                                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                            }`}
                                    >
                                        {template === t.id && (
                                            <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-teal-600" />
                                        )}
                                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-2`}>
                                            <t.icon className="h-4 w-4 text-white" />
                                        </div>
                                        <p className="text-xs font-bold">{t.name}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 py-0.5">
                            <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
                            <Label htmlFor="terms" className="text-[11px] font-medium cursor-pointer leading-snug">
                                I agree to the{" "}
                                <Link href="/legal/terms" className="text-teal-600 dark:text-teal-400 hover:underline font-bold">Terms</Link>
                                {" "}&{" "}
                                <Link href="/legal/privacy" className="text-teal-600 dark:text-teal-400 hover:underline font-bold">Privacy Policy</Link>
                            </Label>
                        </div>

                        <Button type="submit" disabled={loading || !agreed}
                            className="w-full h-11 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <>Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-muted-foreground mt-5">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
