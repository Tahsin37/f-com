"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    Globe, Plus, Loader2, Trash2, CheckCircle2, Clock, AlertCircle,
    Copy, ExternalLink, RefreshCw, Shield
} from "lucide-react"

interface DomainRecord {
    domain: string
    status: "pending" | "verified" | "active" | "failed"
    added_at: string
    verified_at?: string
    txt_record?: string
}

export default function DomainManagerPage() {
    const [loading, setLoading] = useState(true)
    const [sellerId, setSellerId] = useState("")
    const [sellerSlug, setSellerSlug] = useState("")
    const [domains, setDomains] = useState<DomainRecord[]>([])
    const [newDomain, setNewDomain] = useState("")
    const [adding, setAdding] = useState(false)
    const [verifying, setVerifying] = useState<string | null>(null)
    const [currentSettings, setCurrentSettings] = useState<Record<string, any>>({})

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user?.id) { setLoading(false); return }

            const { data: seller } = await supabase
                .from("sellers")
                .select("id, slug")
                .eq("user_id", session.user.id)
                .single()

            if (!seller) { setLoading(false); return }

            setSellerId(seller.id)
            setSellerSlug(seller.slug)

            // Fetch domains from domains table
            const { data: domainsData } = await supabase
                .from("domains")
                .select("*")
                .eq("seller_id", seller.id)
                .order("created_at", { ascending: false })

            if (domainsData) {
                // Map the DB structure to our DomainRecord interface for UI consistency
                setDomains(domainsData.map(d => ({
                    domain: d.domain,
                    status: d.verified ? "verified" : "pending",
                    added_at: d.created_at,
                    verified_at: d.verified_at,
                    txt_record: d.verification_token
                })))
            }

            setLoading(false)
        }
        load()
    }, [])

    const addDomain = async () => {
        const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
        if (!d) { toast.error("Please enter a domain"); return }
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) { toast.error("Invalid domain format"); return }
        if (domains.find(x => x.domain === d)) { toast.error("Domain already added"); return }

        setAdding(true)
        try {
            const res = await fetch("/api/domains/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId, domain: d })
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to add domain")
                setAdding(false)
                return
            }

            const record: DomainRecord = {
                domain: data.domain,
                status: "pending",
                added_at: new Date().toISOString(),
                txt_record: data.txt_record,
            }

            setDomains(prev => [record, ...prev])
            setNewDomain("")
            toast.success("Domain added! Follow the DNS setup instructions below.")
        } catch (error) {
            toast.error("Failed to add domain. Try again.")
        } finally {
            setAdding(false)
        }
    }

    const verifyDomain = async (domain: string) => {
        setVerifying(domain)
        try {
            const res = await fetch(`/api/domains/verify?domain=${encodeURIComponent(domain)}&seller_id=${sellerId}`)
            const data = await res.json()

            if (data.verified) {
                setDomains(prev => prev.map(d => d.domain === domain ? { ...d, status: "verified", verified_at: new Date().toISOString() } : d))
                toast.success("Domain verified! 🎉")
            } else {
                toast.error(data.message || "DNS record not found yet. It may take up to 48 hours to propagate.")
            }
        } catch {
            toast.error("Verification failed. Try again later.")
        }
        setVerifying(null)
    }

    const removeDomain = async (domain: string) => {
        if (!confirm(`Are you sure you want to remove ${domain}?`)) return

        const { error } = await supabase
            .from("domains")
            .delete()
            .eq("domain", domain)
            .eq("seller_id", sellerId)

        if (error) {
            toast.error("Failed to remove domain")
            return
        }

        setDomains(prev => prev.filter(d => d.domain !== domain))
        toast.success("Domain removed")
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied!")
    }

    const statusConfig = {
        pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Pending Verification" },
        verified: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", label: "Verified" },
        active: { icon: CheckCircle2, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", label: "Active" },
        failed: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Failed" },
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Custom Domains</h1>
                <p className="text-muted-foreground text-sm mt-1">Connect your own domain to your store</p>
            </div>

            {/* Default Store URL */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground mb-1">Default Store URL</p>
                            <p className="text-sm font-mono font-semibold text-teal-600">{typeof window !== "undefined" ? window.location.origin : ""}/store/{sellerSlug}</p>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg gap-1"
                            onClick={() => copyToClipboard(`${typeof window !== "undefined" ? window.location.origin : ""}/store/${sellerSlug}`)}>
                            <Copy className="h-3 w-3" /> Copy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Add Domain */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-teal-500" /> Add Custom Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            value={newDomain}
                            onChange={e => setNewDomain(e.target.value)}
                            placeholder="shop.yourdomain.com"
                            className="h-11 rounded-xl flex-1"
                            onKeyDown={e => e.key === "Enter" && addDomain()}
                        />
                        <Button onClick={addDomain} disabled={adding} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-1 px-6 font-bold">
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Add
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Enter your domain without http:// (e.g., shop.yourdomain.com or www.mystore.com)</p>
                </CardContent>
            </Card>

            {/* Domain List */}
            {domains.length > 0 && (
                <div className="space-y-3">
                    {domains.map(d => {
                        const status = statusConfig[d.status]
                        const StatusIcon = status.icon
                        return (
                            <Card key={d.domain}>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-bold text-sm">{d.domain}</p>
                                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${status.bg} ${status.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {d.status === "pending" && (
                                                <Button variant="outline" size="sm" className="rounded-lg gap-1 text-xs"
                                                    disabled={verifying === d.domain}
                                                    onClick={() => verifyDomain(d.domain)}>
                                                    {verifying === d.domain ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                                    Verify
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600" onClick={() => removeDomain(d.domain)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* DNS Setup Instructions */}
                                    {d.status === "pending" && d.txt_record && (
                                        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 space-y-3">
                                            <p className="text-xs font-bold flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-teal-500" /> DNS Setup Required</p>

                                            <div className="space-y-2">
                                                <p className="text-[11px] font-semibold">Step 1: Add a CNAME record</p>
                                                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 font-mono text-xs space-y-1">
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-bold">CNAME</span></div>
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-bold">{d.domain.split(".")[0]}</span></div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">Value:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-bold">cname.fmanager.app</span>
                                                            <button onClick={() => copyToClipboard("cname.fmanager.app")}><Copy className="h-3 w-3 text-muted-foreground" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[11px] font-semibold">Step 2: Add a TXT record for verification</p>
                                                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 font-mono text-xs space-y-1">
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-bold">TXT</span></div>
                                                    <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-bold">_fmanager</span></div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground">Value:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-bold">{d.txt_record}</span>
                                                            <button onClick={() => copyToClipboard(d.txt_record!)}><Copy className="h-3 w-3 text-muted-foreground" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-muted-foreground">DNS changes can take up to 48 hours to propagate. Click &quot;Verify&quot; after adding the records.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {domains.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Globe className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <h3 className="font-bold text-lg mb-1">No Custom Domains</h3>
                        <p className="text-muted-foreground text-sm">Add a custom domain to give your store a professional URL</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
