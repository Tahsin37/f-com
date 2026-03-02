"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, Users, BarChart3 } from "lucide-react"

export default function WorkerSignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            // Check if this user is a worker
            const { data: worker, error: workerError } = await supabase
                .from("workers")
                .select("*, sellers(name)")
                .eq("email", email)
                .eq("is_active", true)
                .single()

            if (!worker) {
                await supabase.auth.signOut()
                toast.error("No active worker account found for this email")
                setLoading(false)
                return
            }

            toast.success(`Welcome back, ${worker.name}!`, {
                description: `Signed in to ${(worker as any).sellers?.name || "store"}`
            })
            router.push("/dashboard")
        } catch (err: any) {
            toast.error(err.message || "Failed to sign in")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 text-white flex-col justify-between p-12">
                <div>
                    <Link href="/" className="flex items-center gap-2.5 mb-20">
                        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-extrabold text-xl">F-Manager</span>
                    </Link>

                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 inline-block">
                            <Users className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight">
                            Worker<br />
                            <span className="text-white/80">Portal.</span>
                        </h1>
                        <p className="text-white/70 text-lg max-w-sm leading-relaxed">
                            Sign in to manage products, process orders, and help run the store you&apos;ve been invited to.
                        </p>
                    </div>
                </div>

                <p className="text-white/40 text-sm">© 2026 F-Manager by Team Sifr</p>
            </div>

            {/* Right Panel — Sign In Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50 dark:bg-[#0a0a0a]">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-lg text-teal-600">F-Manager</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold tracking-tight">Worker Sign In</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Sign in with the credentials from your invitation email.
                        </p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="font-semibold">Email <span className="text-red-500">*</span></Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="worker@example.com"
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold">Password <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 rounded-xl pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                            {loading ? "Signing in..." : "Sign In as Worker"}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>
                            Store owner?{" "}
                            <Link href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-bold">
                                Sign in here
                            </Link>
                        </p>
                        <p className="mt-2">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-bold">
                                Create store
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
