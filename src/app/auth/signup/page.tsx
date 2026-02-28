"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BarChart3, Eye, EyeOff, ArrowRight, ShieldCheck, Truck, Smartphone, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
    const [form, setForm] = useState({ name: "", storeName: "", phone: "", email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!agreed) { toast.error("Please accept the Terms of Service"); return }
        if (!form.name || !form.phone || !form.password || !form.email) {
            toast.error("Please fill in all required fields")
            return
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            // 1. Create Supabase Auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name,
                        phone: form.phone,
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("No user returned")

            // 2. Generate a slug from the store name or name
            const rawSlug = (form.storeName || form.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")

            // Make slug unique with a short random suffix
            const slug = `${rawSlug}-${Math.floor(1000 + Math.random() * 9000)}`

            // 3. Insert a sellers row linked to the new auth user
            const { error: sellerError } = await supabase.from("sellers").insert({
                user_id: authData.user.id,
                name: form.storeName || form.name,
                slug,
                phone: form.phone,
                email: form.email,
                plan: "free",
                settings: { delivery_inside: 60, delivery_outside: 120 }
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-xl text-teal-600 dark:text-teal-400">F-Manager</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-foreground mb-2">Create your account</h1>
                        <p className="text-muted-foreground">Start managing your F-commerce sales today. Free forever.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">Your Name <span className="text-destructive">*</span></Label>
                                <Input id="name" placeholder="Sabrina Rahman" value={form.name} onChange={e => update("name", e.target.value)}
                                    className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storeName" className="font-semibold">Store Name</Label>
                                <Input id="storeName" placeholder="Zara's Wardrobe" value={form.storeName} onChange={e => update("storeName", e.target.value)}
                                    className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="font-semibold">Phone Number <span className="text-destructive">*</span></Label>
                            <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => update("phone", e.target.value)}
                                className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold">Email Address <span className="text-destructive">*</span></Label>
                            <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)}
                                className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-semibold">Password <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={e => update("password", e.target.value)}
                                    className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 pr-12" />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-1">
                            <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
                            <Label htmlFor="terms" className="text-sm font-medium cursor-pointer leading-snug">
                                I agree to the{" "}
                                <Link href="/legal/terms" className="text-teal-600 dark:text-teal-400 hover:underline font-bold">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/legal/privacy" className="text-teal-600 dark:text-teal-400 hover:underline font-bold">Privacy Policy</Link>
                            </Label>
                        </div>

                        <Button type="submit" disabled={loading || !agreed}
                            className="w-full h-12 rounded-xl font-bold text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : <>Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
