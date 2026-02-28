"use client"

import React from "react"
import { Header } from "@/components/f-manager/Header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function SettingsPage() {
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success("Settings saved successfully!")
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <Header />

            <main className="container max-w-3xl py-12 animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold mb-8 tracking-tight">Integrations & Settings</h1>

                <form onSubmit={handleSave} className="space-y-6">
                    <Card className="rounded-3xl border-0 shadow-xl dark:bg-neutral-900 border-t-2 border-t-blue-500">
                        <CardHeader>
                            <CardTitle>Steadfast Courier API</CardTitle>
                            <CardDescription>Enter your Steadfast API keys for 1-click booking.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">API Key</label>
                                <Input type="password" placeholder="sf_live_xxxxxxxxxxx" className="bg-slate-50 dark:bg-neutral-950" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Secret Key</label>
                                <Input type="password" placeholder="sf_sec_xxxxxxxxxxx" className="bg-slate-50 dark:bg-neutral-950" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-xl dark:bg-neutral-900 border-t-2 border-t-pink-500">
                        <CardHeader>
                            <CardTitle>bKash / Nagad Auto Matching (RuxSpeed)</CardTitle>
                            <CardDescription>Enable auto verification for mobile payments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Personal bKash Number</label>
                                <Input placeholder="017XXXXXXXX" className="bg-slate-50 dark:bg-neutral-950" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700 px-8 rounded-xl font-bold shadow-teal-500/20 shadow-lg">
                            Save All Settings
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
