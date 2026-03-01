"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BarChart3, Eye, EyeOff, ArrowRight, Smartphone, ShieldCheck, Truck, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignInPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Please fill in all fields")
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            toast.success("Welcome back to F-Manager!")
            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || "Invalid email or password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex">
            {/* Left: Branding Panel */}
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
                        Your F-Commerce <br />
                        <span className="text-teal-400">Command Center.</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            { icon: ShieldCheck, text: "OTP Verified Orders — 80% fewer fakes" },
                            { icon: Truck, text: "1-Click Steadfast & Pathao Booking" },
                            { icon: Smartphone, text: "Live Storefront on your subdomain in 5 min" },
                        ].map((item) => (
                            <div key={item.text} className="flex items-center gap-3 text-slate-300">
                                <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                                    <item.icon className="h-4 w-4 text-teal-400" />
                                </div>
                                <span className="text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-slate-500 text-sm relative z-10">© 2026 F-Manager by Team Sifr. All rights reserved.</p>
            </div>

            {/* Right: Sign In Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-xl text-teal-600 dark:text-teal-400">F-Manager</span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-foreground mb-2">Welcome back</h1>
                        <p className="text-muted-foreground">Sign in to your F-Manager account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="font-semibold">Password</Label>
                                <Link href="#" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 pr-12"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl font-bold text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                        >
                            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
                            Create one free
                        </Link>
                    </p>

                    <p className="text-center text-sm text-muted-foreground mt-3">
                        Are you a worker?{" "}
                        <Link href="/auth/worker" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Sign in as Worker →
                        </Link>
                    </p>

                    <p className="text-center text-xs text-muted-foreground mt-4">
                        By signing in, you agree to our{" "}
                        <Link href="/legal/terms" className="underline hover:text-foreground">Terms of Service</Link>
                        {" "}and{" "}
                        <Link href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}
