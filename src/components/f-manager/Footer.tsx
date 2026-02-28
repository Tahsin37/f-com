import React from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, MapPin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-black text-neutral-400 py-16 md:py-24 border-t border-white/10">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-white font-extrabold text-2xl tracking-tight flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full bg-teal-500"></span>
                                F-Manager
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-8 max-w-sm">
                            The all-in-one automated sales, logistics, and OTP-verification platform specifically engineered for F-commerce sellers in Bangladesh.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors duration-300">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors duration-300">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors duration-300">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/demo/sifr-style" className="hover:text-teal-400 transition-colors">Demo Store</Link></li>
                            <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">Admin Dashboard</Link></li>
                            <li><Link href="/dashboard/quick-sell" className="hover:text-teal-400 transition-colors">POS &amp; Quick Sell</Link></li>
                            <li><Link href="/#pricing" className="hover:text-teal-400 transition-colors">Pricing Plans</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Company</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/legal/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                            <li><a href="mailto:support@fmanager.com" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Contact</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="flex gap-3">
                                <Mail className="w-5 h-5 text-teal-500 shrink-0" />
                                <a href="mailto:support@fmanager.com" className="hover:text-teal-400 transition-colors">support@fmanager.com</a>
                            </li>
                            <li className="flex gap-3">
                                <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
                                <span>Banani, Dhaka-1213<br />Bangladesh</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium">
                    <p>© {new Date().getFullYear()} F-Manager by Team Sifr. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <span>Made with <span className="text-rose-500 mx-1">❤️</span> in BD 🇧🇩</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
