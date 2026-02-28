import React from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export const metadata = {
    title: "Terms of Service | F-Manager",
    description: "Read the Terms of Service for F-Manager — Bangladesh's F-commerce SaaS platform.",
}

const sections = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: `By accessing or using F-Manager ("the Platform," "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform. These terms apply to all users, including sellers, administrators, and visitors.`
    },
    {
        id: "service",
        title: "2. Description of Service",
        content: `F-Manager is a B2B2C Software-as-a-Service (SaaS) platform designed for F-commerce (Facebook & Instagram commerce) sellers in Bangladesh. The platform provides: automated order management, OTP-verified checkout, courier booking integration (Steadfast, Pathao), payment verification (bKash, Nagad), inventory management, and analytics dashboards.`
    },
    {
        id: "account",
        title: "3. Account Registration",
        content: `To use F-Manager, you must register for an account by providing accurate and complete information including your name, phone number, store name, and other requested details. You are responsible for maintaining the confidentiality of your account credentials. F-Manager is not liable for any loss resulting from unauthorized use of your account.`
    },
    {
        id: "plans",
        title: "4. Subscription Plans & Billing",
        content: `F-Manager offers a Free plan and a Professional plan (৳499/month or ৳399/month billed annually). The Free plan is limited to 20 products. Professional plan features include unlimited products, 1-click courier booking, bKash/Nagad auto-verification, Mini-POS, Blacklist database access, and Priority WhatsApp Support. All paid subscriptions are billed in advance and are non-refundable unless otherwise stated.`
    },
    {
        id: "prohibited",
        title: "5. Prohibited Uses",
        content: `You may not use F-Manager to: (a) violate any applicable laws or regulations; (b) sell counterfeit, illegal, or prohibited goods; (c) engage in fraudulent activities or misrepresent your identity; (d) attempt to gain unauthorized access to any part of the platform; (e) use the platform to send spam or unsolicited communications; (f) interfere with or disrupt the integrity or performance of the Service.`
    },
    {
        id: "data",
        title: "6. Data & Privacy",
        content: `We collect and process user data as described in our Privacy Policy. By using F-Manager, you consent to our collection and use of personal information. Customer data collected through your storefront (names, phone numbers, addresses) is managed by you as the seller. You are responsible for ensuring you have the necessary consents from your customers.`
    },
    {
        id: "courier",
        title: "7. Third-Party Courier & Payment Integrations",
        content: `F-Manager integrates with third-party services including Steadfast Courier, Pathao, bKash, and Nagad. Your use of these services is also governed by their respective terms of service. F-Manager is not responsible for delays, losses, or errors caused by third-party service providers.`
    },
    {
        id: "ip",
        title: "8. Intellectual Property",
        content: `All content, features, and functionality of F-Manager, including but not limited to text, graphics, logos, and software, are the exclusive property of Team Sifr and are protected by international copyright, trademark, and other intellectual property laws.`
    },
    {
        id: "termination",
        title: "9. Termination",
        content: `We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, your right to use the Service will cease immediately. You may export your data within 30 days of account termination.`
    },
    {
        id: "liability",
        title: "10. Limitation of Liability",
        content: `To the maximum extent permitted by applicable law, F-Manager and Team Sifr shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of the Service.`
    },
    {
        id: "changes",
        title: "11. Changes to Terms",
        content: `We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new Terms.`
    },
    {
        id: "law",
        title: "12. Governing Law",
        content: `These Terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.`
    }
]

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-xl text-teal-600 dark:text-teal-400">F-Manager</span>
                    </Link>
                    <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">← Back to Home</Link>
                </div>
            </header>

            <div className="container max-w-4xl px-4 md:px-6 py-16 md:py-24">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 mb-6">
                        Legal Document
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using F-Manager. These terms govern your use of our platform and services.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4 font-medium">
                        Last updated: February 27, 2025 &nbsp;·&nbsp; Effective: February 27, 2025
                    </p>
                </div>

                {/* Table of Contents */}
                <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-6 mb-12 border border-neutral-200 dark:border-neutral-800">
                    <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Table of Contents</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {sections.map((s) => (
                            <a key={s.id} href={`#${s.id}`} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map((s) => (
                        <section key={s.id} id={s.id} className="scroll-mt-24">
                            <h2 className="text-xl font-extrabold text-foreground mb-3">{s.title}</h2>
                            <p className="text-muted-foreground leading-relaxed text-base">{s.content}</p>
                        </section>
                    ))}
                </div>

                {/* Contact */}
                <div className="mt-16 p-8 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-100 dark:border-teal-900 text-center">
                    <h3 className="font-bold text-lg mb-2">Questions about our Terms?</h3>
                    <p className="text-muted-foreground text-sm mb-4">We&apos;re happy to clarify anything. Reach out to our team.</p>
                    <a href="mailto:legal@fmanager.com.bd" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
                        legal@fmanager.com.bd
                    </a>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
                <div className="container px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <span>© 2025 F-Manager by Team Sifr</span>
                    <div className="flex gap-6">
                        <Link href="/legal/terms" className="hover:text-foreground font-semibold text-teal-600 dark:text-teal-400">Terms</Link>
                        <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
                        <Link href="/" className="hover:text-foreground">Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
