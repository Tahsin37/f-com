"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, ShieldCheck, CreditCard, Smartphone } from "lucide-react"

const features = [
    {
        icon: Truck,
        title: "1-Click Courier Booking",
        titleBn: "১-ক্লিকে কুরিয়ার বুকিং",
        desc: "Book Steadfast or Pathao directly from your dashboard. No manual entry needed.",
        color: "group-hover:text-blue-500 group-hover:bg-blue-500/10 text-muted-foreground",
    },
    {
        icon: ShieldCheck,
        title: "OTP Verified Orders",
        titleBn: "OTP ভেরিফাইড অর্ডার",
        desc: "Reduce fake orders by 80%. Every customer must verify their phone before placing an order.",
        color: "group-hover:text-emerald-500 group-hover:bg-emerald-500/10 text-muted-foreground",
    },
    {
        icon: Smartphone,
        title: "Zero Technical Hassle",
        titleBn: "কোনো প্রযুক্তি ঝামেলা নেই",
        desc: "No domain, no hosting. Get a ready-made storefront on your own subdomain instantly.",
        color: "group-hover:text-violet-500 group-hover:bg-violet-500/10 text-muted-foreground",
    },
    {
        icon: CreditCard,
        title: "bKash / Nagad Integration",
        titleBn: "বিকাশ / নগদ ইন্টিগ্রেশন",
        desc: "Accept payments without a trade license. Auto-verify TrxIDs with our RuxSpeed engine.",
        color: "group-hover:text-pink-500 group-hover:bg-pink-500/10 text-muted-foreground",
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 md:py-32 bg-slate-50 dark:bg-black relative overflow-hidden">
            {/* Background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
                        Everything You Need <br className="hidden md:block" />
                        <span className="text-gradient">To Scale Automatically.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        F-Manager orchestrates the entire sales & logistics pipeline. From storefront to customer doorstep.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {features.map((f) => (
                        <Card key={f.title} className="neo-card neo-card-hover border-transparent group overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <CardContent className="p-8 flex flex-col items-center text-center relative h-full">
                                {/* Top highlight line on hover */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 bg-slate-100 dark:bg-neutral-800 ${f.color}`}>
                                    <f.icon className="h-6 w-6" />
                                </div>

                                <h3 className="font-bold text-xl mb-2 text-foreground tracking-tight">{f.title}</h3>
                                <p className="text-xs font-bn text-teal-600 dark:text-teal-400 font-medium mb-4">{f.titleBn}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-auto">{f.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
