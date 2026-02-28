"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ShieldAlert, Video, Truck, Link as LinkIcon, Lock } from "lucide-react"

const faqs = [
    {
        icon: Lock,
        q: "আমি কি ফ্রি প্ল্যানে শুরু করতে পারব?",
        a: "হ্যাঁ! ফ্রি প্ল্যানে আপনি ২০টি প্রোডাক্ট যোগ করতে পারবেন, OTP ভেরিফাইড চেকআউট পাবেন, এবং Cash on Delivery সাপোর্ট পাবেন। কোনো ক্রেডিট কার্ড বা পেমেন্ট দরকার নেই।",
    },
    {
        q: "কাস্টমারদের কি অ্যাকাউন্ট খুলতে হবে?",
        a: "না! কাস্টমারদের কোনো অ্যাকাউন্ট খুলতে হবে না। মাত্র ৩টি ফিল্ড পূরণ করলেই (নাম, ফোন, ঠিকানা) অর্ডার হয়ে যাবে। এটাই আমাদের 'Frictionless Checkout'।",
    },
    {
        icon: Truck,
        q: "Steadfast কুরিয়ার কীভাবে কানেক্ট করব?",
        a: "সেটিংস পেজে গিয়ে আপনার Steadfast API Key ও Secret Key বসান। আমরা ভিডিও টিউটোরিয়াল দিয়ে দিয়েছি, এবং Pro ইউজারদের Team Sifr বিনামূল্যে সেটআপ করে দেবে।",
    },
    {
        icon: ShieldAlert,
        q: "ফেক অর্ডার থেকে কীভাবে বাঁচব?",
        a: "আমাদের সিস্টেমে OTP Verification বাধ্যতামূলক। এছাড়া Blacklist Database আছে — আগে রিটার্ন করা নাম্বার থাকলে ড্যাশবোর্ডে 🔴 Red Flag দেখাবে।",
    },
    {
        icon: LinkIcon,
        q: "পেমেন্ট গেটওয়ে কি আছে?",
        a: "১ম ধাপে Cash on Delivery এবং ম্যানুয়াল bKash/Nagad TrxID সাপোর্ট করি। খুব শীঘ্রই RuxSpeed গেটওয়ে দিয়ে অটো পেমেন্ট ভেরিফিকেশন আসবে — কোনো ট্রেড লাইসেন্স ছাড়াই।",
    },
]

export function FAQSection() {
    return (
        <section className="py-24 md:py-32 bg-white dark:bg-black relative overflow-hidden text-center">
            <div className="container px-4 md:px-6 relative z-10 max-w-4xl mx-auto">
                <div className="flex flex-col gap-12 items-center">

                    <div className="max-w-xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            সচরাচর জিজ্ঞাসা <br className="hidden md:block" /> ও উত্তর সমূহ
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 font-medium">
                            Find answers to the most common questions from Bangladeshi F-commerce sellers. Everything you need to know about F-Manager.
                        </p>
                        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 rounded-3xl p-6 md:p-8 relative overflow-hidden group text-center flex flex-col items-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700" />
                            <Video className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Need Help Getting Started?</h3>
                            <p className="text-sm text-muted-foreground mb-4">Watch our 3-minute video guide on setting up your storefront and integrating Steadfast.</p>
                            <a href="#" className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline">Watch Tutorial →</a>
                        </div>
                    </div>

                    <div className="w-full text-left">
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, i) => (
                                <AccordionItem
                                    key={i}
                                    value={`faq-${i}`}
                                    className="neo-card border-transparent bg-slate-50/50 dark:bg-neutral-900/50 px-6 py-2 data-[state=open]:shadow-md transition-all duration-300"
                                >
                                    <AccordionTrigger className="text-left text-lg font-bold py-5 hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
                                        <div className="flex items-center gap-4">
                                            {faq.icon && <faq.icon className="w-5 h-5 text-teal-500 shrink-0" />}
                                            <span className="font-bn">{faq.q}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 pt-2 font-medium font-bn">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                </div>
            </div>
        </section>
    )
}
