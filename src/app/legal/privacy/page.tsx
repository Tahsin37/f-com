import React from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export const metadata = {
    title: "Privacy Policy | F-Manager",
    description: "Learn how F-Manager collects, uses, and protects your personal information.",
}

const sections = [
    {
        id: "overview",
        title: "1. Overview",
        content: `F-Manager ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. This policy applies to all users including sellers and their customers.`
    },
    {
        id: "collection",
        title: "2. Information We Collect",
        content: `We collect information you provide directly to us, including: (a) Account information: name, email address, phone number, store name, and password; (b) Business information: products, pricing, inventory data, store configuration; (c) Transaction data: order details, payment references, delivery addresses; (d) Customer data: names and phone numbers of your storefront customers (collected on your behalf as a data processor); (e) Usage data: pages visited, features used, click patterns, session duration; (f) Device data: IP address, browser type, operating system.`
    },
    {
        id: "use",
        title: "3. How We Use Your Information",
        content: `We use your information to: provide and improve the F-Manager platform; process orders and facilitate courier bookings; verify payments via bKash/Nagad TrxID; send transactional notifications (OTPs, order confirmations); provide customer support; analyze usage to improve features; detect and prevent fraud (Blacklist Database feature); comply with legal obligations; and send platform updates if you have opted in.`
    },
    {
        id: "sharing",
        title: "4. Information Sharing",
        content: `We share your information with: (a) Courier Partners (Steadfast, Pathao) — to fulfill delivery bookings; (b) Payment Processors — to verify transactions; (c) Cloud Infrastructure Providers — to host and operate the platform securely; (d) Law Enforcement — only when required by law or valid legal process. We do not sell your personal information to third parties.`
    },
    {
        id: "customer-data",
        title: "5. Customer Data (Your Storefront Customers)",
        content: `As a seller on F-Manager, you collect customer data through your storefront (customer name, phone number, delivery address). You are the data controller for this information. F-Manager processes this data on your behalf as a data processor. You are responsible for ensuring you have appropriate consents from your customers and for complying with applicable data protection laws.`
    },
    {
        id: "security",
        title: "6. Data Security",
        content: `We implement industry-standard security measures including: HTTPS encryption for all data transmission; encrypted storage of passwords and sensitive data; access controls and role-based permissions; regular security audits; OTP-based authentication. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
        id: "retention",
        title: "7. Data Retention",
        content: `We retain your account data for as long as your account is active. Order histories are retained for 3 years for compliance purposes. If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.`
    },
    {
        id: "rights",
        title: "8. Your Rights",
        content: `You have the right to: access your personal data; correct inaccurate data; request deletion of your data; export your data in a portable format; opt out of marketing communications; withdraw consent where processing is based on consent. To exercise these rights, contact us at privacy@fmanager.com.bd.`
    },
    {
        id: "cookies",
        title: "9. Cookies & Tracking",
        content: `We use cookies and similar technologies to: maintain your session and preferences (language, theme); analyze platform usage via anonymous analytics; remember your login status. You can control cookies through your browser settings. Disabling cookies may limit some platform functionality.`
    },
    {
        id: "children",
        title: "10. Children's Privacy",
        content: `F-Manager is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that we have collected information from a child under 18, we will delete that information promptly.`
    },
    {
        id: "changes",
        title: "11. Changes to This Policy",
        content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will notify you via email or in-app notification.`
    },
    {
        id: "contact",
        title: "12. Contact Us",
        content: `If you have questions about this Privacy Policy or how we handle your data, please contact us at: privacy@fmanager.com.bd. Postal address: Team Sifr, Dhaka, Bangladesh.`
    }
]

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
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
                <div className="text-center mb-16">
                    <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 mb-6">
                        Legal Document
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We take your privacy seriously. This policy explains exactly what data we collect, why we collect it, and how we protect it.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4 font-medium">
                        Last updated: February 27, 2025 &nbsp;·&nbsp; Effective: February 27, 2025
                    </p>
                </div>

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

                <div className="space-y-10">
                    {sections.map((s) => (
                        <section key={s.id} id={s.id} className="scroll-mt-24">
                            <h2 className="text-xl font-extrabold text-foreground mb-3">{s.title}</h2>
                            <p className="text-muted-foreground leading-relaxed text-base">{s.content}</p>
                        </section>
                    ))}
                </div>

                <div className="mt-16 p-8 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-100 dark:border-teal-900 text-center">
                    <h3 className="font-bold text-lg mb-2">Privacy Questions?</h3>
                    <p className="text-muted-foreground text-sm mb-4">Our team is available to help with any privacy-related concerns.</p>
                    <a href="mailto:privacy@fmanager.com.bd" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
                        privacy@fmanager.com.bd
                    </a>
                </div>
            </div>

            <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
                <div className="container px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <span>© 2025 F-Manager by Team Sifr</span>
                    <div className="flex gap-6">
                        <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
                        <Link href="/legal/privacy" className="hover:text-foreground font-semibold text-teal-600 dark:text-teal-400">Privacy</Link>
                        <Link href="/" className="hover:text-foreground">Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
