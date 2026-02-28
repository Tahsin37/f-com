"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

// Import components to showcase
import { Hero } from "@/components/f-manager/Hero"
import { FeaturesSection } from "@/components/f-manager/FeaturesSection"
import { ProductCard } from "@/components/f-manager/ProductCard"
import { ProductDrawer } from "@/components/f-manager/ProductDrawer"
import { StickyCartBar } from "@/components/f-manager/StickyCartBar"
import { TestimonialSection } from "@/components/f-manager/TestimonialSection"
import { PricingSection } from "@/components/f-manager/PricingSection"

const ComponentBlock = ({ title, descEn, descBn, children }: { title: string, descEn: string, descBn: string, children: React.ReactNode }) => (
    <div className="mb-24 border rounded-3xl overflow-hidden bg-slate-50 dark:bg-black">
        <div className="bg-white dark:bg-neutral-900 border-b p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">{title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Usage Note (EN)</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{descEn}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Usage Note (BN)</h4>
                    <p className="text-sm font-bn text-teal-700 dark:text-teal-400 leading-relaxed">{descBn}</p>
                </div>
            </div>
        </div>
        <div className="p-8 md:p-12 relative overflow-hidden flex justify-center bg-slate-100/50 dark:bg-neutral-950">
            {children}
        </div>
    </div>
)

export default function ComponentLibraryPage() {
    const { setTheme, theme } = useTheme()
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Mock product for ProductCard & Drawer
    const mockProduct = {
        id: "prod-library",
        name: "Premium Cotton Panjabi",
        price: 1850,
        originalPrice: 2200,
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800&h=800",
        images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800&h=800"],
        inStock: true,
        variants: [
            { id: "v1", name: "M" },
            { id: "v2", name: "L" },
            { id: "v3", name: "XL" }
        ]
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
                <div className="container px-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-xl tracking-tight">F-Manager Component Library</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="rounded-full"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </header>

            <div className="container px-4 py-12 max-w-6xl mx-auto">

                {/* Foundation Tokens */}
                <div className="mb-24">
                    <h2 className="text-3xl font-extrabold mb-8 tracking-tight">Design Tokens</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-6 rounded-2xl bg-[#0EA5A4] text-white">
                            <p className="font-bold">Primary Teal</p>
                            <p className="text-sm opacity-80">#0EA5A4</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[#FFD166] text-black">
                            <p className="font-bold">Accent Yellow</p>
                            <p className="text-sm opacity-80">#FFD166</p>
                        </div>
                        <div className="p-6 rounded-2xl neo-light flex items-center justify-center text-black">
                            <p className="font-bold text-sm">Light Neumorphic</p>
                        </div>
                        <div className="p-6 rounded-2xl neo-dark flex items-center justify-center text-white">
                            <p className="font-bold text-sm">Dark Neumorphic</p>
                        </div>
                    </div>
                </div>

                {/* Components */}
                <ComponentBlock
                    title="1. Hero Section (with Bento Grid)"
                    descEn="The primary landing hero. Features a 2-column layout with a dynamic 3x3 neumorphic Bento grid. Use this to instantly communicate the software's value proposition. The grid responds to hover states with particle glows."
                    descBn="ল্যান্ডিং পেজের মূল হিরো সেকশন। ডানপাশে ৩x৩ নিওমরফিক বেন্টো গ্রিড রয়েছে যা হোভার করলে গ্লো করে। কাস্টমারকে সফটওয়্যারের মূল সুবিধা বোঝাতে এটি ব্যবহার করুন।"
                >
                    <div className="w-full scale-75 origin-top border bg-background rounded-3xl overflow-hidden shadow-2xl">
                        <Hero />
                    </div>
                </ComponentBlock>

                <ComponentBlock
                    title="2. Feature Cards (Neumorphic Hover)"
                    descEn="Used to explain core platform features. These cards use a subtle inset shadow which transforms into a deep drop-shadow with a glowing top border on hover. Ideal for 4-column feature highlights."
                    descBn="প্ল্যাটফর্মের মূল ফিচারগুলো বোঝাতে ব্যবহৃত হয়। এই কার্ডগুলোতে হোভার করলে এর চারদিকে গ্লোয়িং বর্ডার ও শ্যাডো তৈরি হয়। ৪-কলাম ফিচারের জন্য পারফেক্ট।"
                >
                    <div className="w-full scale-75 origin-top border bg-background rounded-3xl overflow-hidden shadow-2xl">
                        <FeaturesSection />
                    </div>
                </ComponentBlock>

                <ComponentBlock
                    title="3. Testimonial & Trust Strip"
                    descEn="Social proof component. The top strip features grayscale logos that gain color on hover. The review cards use a clean quote icon and a prominent avatar to build trust."
                    descBn="সোশ্যাল প্রুফ এবং রিভিউ সেকশন। উপরের লোগোগুলো হোভার করলে কালারফুল হয়। রিভিউ কার্ডগুলো কাস্টমারের আস্থা বাড়ানোর জন্য ডিজাইন করা হয়েছে।"
                >
                    <div className="w-full scale-75 origin-top border bg-background rounded-3xl overflow-hidden shadow-2xl">
                        <TestimonialSection />
                    </div>
                </ComponentBlock>

                <ComponentBlock
                    title="4. Pricing Toggle Cards"
                    descEn="Responsive pricing section with a Monthly/Yearly toggle saving pill. The 'Pro' card features an animated gradient stroke and a dark-mode-first aesthetic to draw maximum attention."
                    descBn="মান্থলি এবং ইয়ারলি টগল সহ প্রাইসিং সেকশন। 'Pro' কার্ডটিতে একটি অ্যানিমেটেড গ্লোয়িং বর্ডার রয়েছে যা কাস্টমারের মনোযোগ আকর্ষণ করে।"
                >
                    <div className="w-full scale-75 origin-top border bg-background rounded-3xl overflow-hidden shadow-2xl">
                        <PricingSection />
                    </div>
                </ComponentBlock>

                <ComponentBlock
                    title="5. Product Card & Bottom Drawer"
                    descEn="The core e-commerce interaction element. Includes discount badges and a quick-view handler. Clicking opens the ProductDrawer containing size variants and dual CTAs."
                    descBn="ই-কমার্সের মূল এলিমেন্ট। ডিসকাউন্ট ব্যাজ সহ প্রোডাক্ট কার্ড। 'Quick View' তে ক্লিক করলে নিচ থেকে সাইজ এবং কালার সিলেক্টর সহ প্রোডাক্ট ড্রয়ার ওপেন হয়।"
                >
                    <div className="w-full max-w-sm">
                        <ProductCard
                            product={mockProduct}
                            onQuickView={() => setDrawerOpen(true)}
                        />
                        {drawerOpen && (
                            <ProductDrawer
                                product={mockProduct}
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                            />
                        )}
                        <p className="mt-8 text-sm text-center text-muted-foreground animate-pulse">👆 Click &quot;Quick View&quot; to open Drawer</p>
                    </div>
                </ComponentBlock>

                <ComponentBlock
                    title="6. Sticky Cart Bar (Mobile Floating)"
                    descEn="A fixed bottom bar that appears when items are added to the cart. It shows the total price and provides a high-conversion 'Checkout' button leading to the 4-step modal."
                    descBn="কার্টে প্রোডাক্ট যুক্ত থাকলে মোবাইলের নিচে এই ভাসমান বারটি দেখা যায়। এতে মোট মূল্য এবং চেকআউট বাটন থাকে যা কাস্টমারকে দ্রুত অর্ডার করতে সাহায্য করে।"
                >
                    <div className="w-full max-w-md h-64 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl bg-neutral-100 dark:bg-neutral-900 relative">
                        <div className="absolute inset-x-0 bottom-0">
                            <div className="p-4 bg-white dark:bg-black border-t shadow-2xl rounded-b-3xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">1 item</p>
                                    <p className="font-bold text-lg leading-none">৳1,850</p>
                                </div>
                                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 font-bold neo-card neo-card-hover border-transparent">
                                    Checkout <span className="ml-2">→</span>
                                </Button>
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-0 text-muted-foreground font-mono text-sm opacity-50">
                            Simulated Viewport
                        </div>
                    </div>
                </ComponentBlock>

            </div>
        </div>
    )
}
