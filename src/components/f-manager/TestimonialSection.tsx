"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Smartphone, CreditCard, Truck, ShieldCheck, Quote } from "lucide-react"

export function TestimonialSection() {
    const testimonials = [
        {
            name: "Sabrina Rahman",
            store: "Zara's Wardrobe",
            text: "F-Manager saved my life! Before I was tracking 50+ orders manually on Excel and booking Patheo one by one. Now it's a 1-click magic.",
        },
        {
            name: "Imran Hossain",
            store: "Gadget Galaxy Bd",
            text: "The OTP verification feature reduced my fake order rate from 18% to almost zero. The bKash integration is seamless.",
        },
        {
            name: "Nadia Islam",
            store: "Glow & Glamour",
            text: "Setting up a DDC (Direct to Customer) storefront without buying a domain or hosting was incredible. I got my sub-domain live in 5 minutes.",
        },
    ]

    const trustIcons = [
        { icon: Smartphone, label: "bKash" },
        { icon: CreditCard, label: "Nagad" },
        { icon: Truck, label: "Steadfast" },
        { icon: Truck, label: "Pathao" },
    ]

    return (
        <section className="py-20 bg-white dark:bg-neutral-950 border-y border-neutral-200/50 dark:border-neutral-800/50">
            <div className="container px-4 md:px-6">

                {/* Trust Strip */}
                <div className="flex flex-col items-center mb-24">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                        Trusted Partners & Integrations
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {trustIcons.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 group cursor-default">
                                <t.icon className="h-6 w-6 sm:h-8 sm:w-8 group-hover:text-teal-600 transition-colors" />
                                <span className="text-lg sm:text-xl font-bold font-sans">{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonials */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                        Loved by 100+ F-commerce Sellers
                    </h2>
                    <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-accent text-accent" />)}
                    </div>
                    <p className="text-muted-foreground text-sm">4.9/5 Average Rating</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t, i) => (
                        <Card key={i} className="neo-card neo-card-hover border-transparent relative group text-center">
                            <Quote className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-neutral-200 dark:text-neutral-800 group-hover:text-teal-500/10 transition-colors" />
                            <CardContent className="p-8 pt-16 flex flex-col items-center h-full">
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 font-medium z-10 relative">
                                    &quot;{t.text}&quot;
                                </p>
                                <div className="flex flex-col items-center gap-3 mt-auto">
                                    <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-lg">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{t.store}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </section>
    )
}
