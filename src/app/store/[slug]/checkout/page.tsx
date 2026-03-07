"use client"

import React, { use, useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { StoreCartProvider, useStoreCart } from "@/lib/StoreCartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    Loader2, ArrowLeft, Trash2, Minus, Plus, Truck, ShieldCheck,
    CheckCircle2, MapPin, CreditCard, Phone, User, FileText
} from "lucide-react"

function CheckoutInner({ slug }: { slug: string }) {
    const { items, removeItem, updateQuantity, clearCart, subtotal } = useStoreCart()
    const router = useRouter()

    const [seller, setSeller] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState<{ orderId: string; orderNumber: string } | null>(null)

    // OTP verification
    const [otpStep, setOtpStep] = useState<{ orderNumber: string; orderId: string; demoOtp: string } | null>(null)
    const [otpInput, setOtpInput] = useState("")
    const [verifying, setVerifying] = useState(false)

    // Form
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [area, setArea] = useState<"dhaka" | "outside">("dhaka")
    const [payMethod, setPayMethod] = useState<"cod" | "partial_advance" | "full_paid">("cod")
    const [payProvider, setPayProvider] = useState<"bkash" | "nagad">("bkash")
    const [trxId, setTrxId] = useState("")
    const [senderNumber, setSenderNumber] = useState("")

    // Coupon
    const [couponCode, setCouponCode] = useState("")
    const [applyingCoupon, setApplyingCoupon] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

    useEffect(() => {
        supabase.from("sellers").select("id, name, slug, settings").eq("slug", slug).single().then(({ data }) => {
            if (data) setSeller(data)
            setLoading(false)
        })
    }, [slug])

    const settings = seller?.settings || {}
    const themeColor = settings.theme_color || "#0d9488"
    const deliveryCharge = area === "dhaka" ? (settings.delivery_inside ?? 60) : (settings.delivery_outside ?? 120)

    // Calculate discount
    const discountAmount = useMemo(() => {
        if (!appliedCoupon) return 0
        if (appliedCoupon.discount_type === "percentage") {
            return Math.min(Math.round(subtotal * (appliedCoupon.discount_value / 100)), subtotal)
        }
        return Math.min(appliedCoupon.discount_value, subtotal)
    }, [subtotal, appliedCoupon])

    const total = subtotal - discountAmount + deliveryCharge
    const advanceAmount = payMethod === "partial_advance" ? deliveryCharge : payMethod === "full_paid" ? total : 0
    const dueAmount = total - advanceAmount

    const validatePhone = (p: string) => /^01[3-9]\d{8}$/.test(p)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !seller) return
        setApplyingCoupon(true)
        try {
            const { data, error } = await supabase
                .from("coupons")
                .select("*")
                .eq("seller_id", seller.id)
                .ilike("code", couponCode.trim())
                .eq("is_active", true)
                .single()

            if (error || !data) {
                toast.error("Invalid coupon code")
                setAppliedCoupon(null)
                return
            }

            if (data.min_order_amount > 0 && subtotal < data.min_order_amount) {
                toast.error(`Order min ৳${data.min_order_amount} to use this coupon`)
                return
            }

            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                toast.error("Coupon has expired")
                return
            }

            if (data.max_uses && data.uses_count >= data.max_uses) {
                toast.error("Coupon usage limit reached")
                return
            }

            setAppliedCoupon(data)
            toast.success("Coupon applied!")
            setCouponCode("")
        } catch (err) {
            toast.error("Failed to apply coupon")
        } finally {
            setApplyingCoupon(false)
        }
    }

    const handleOrder = async () => {
        if (!name.trim()) { toast.error("Please enter your name"); return }
        if (!validatePhone(phone)) { toast.error("Invalid phone number — must be 11 digits starting with 01"); return }
        if (!address.trim()) { toast.error("Please enter your delivery address"); return }
        if (items.length === 0) { toast.error("Your cart is empty"); return }

        setSubmitting(true)
        try {
            const orderNumber = `FM-${Date.now().toString(36).toUpperCase()}`
            const otpCode = String(Math.floor(100000 + Math.random() * 900000))

            // Create order
            const { data: order, error: orderErr } = await supabase.from("orders").insert({
                order_number: orderNumber,
                seller_id: seller.id,
                customer_name: name,
                customer_phone: phone,
                customer_address: address,
                delivery_area: area,
                delivery_charge: deliveryCharge,
                subtotal,
                total,
                payment_method: payMethod,
                status: payMethod === "cod" ? "pending" : "payment_pending",
                otp_code: otpCode,
                otp_verified: true,
                advance_paid: advanceAmount,
                due_amount: dueAmount,
                provided_trx_id: trxId.trim().toUpperCase() || null,
                sender_number: senderNumber || null,
            }).select("id").single()

            if (orderErr) throw orderErr

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                variant_id: item.variant_id || null,
                product_name: item.name,
                variant_label: item.variant_label || null,
                quantity: item.quantity,
                unit_price: item.price,
            }))
            await supabase.from("order_items").insert(orderItems)

            // Decrement stock for each item
            for (const item of items) {
                try {
                    await supabase.rpc("decrement_stock", {
                        p_product_id: item.id,
                        p_variant_id: item.variant_id || null,
                        p_qty: item.quantity,
                    })
                } catch { /* stock might not have rpc yet */ }
            }

            // Add tracking entry
            try {
                await supabase.from("order_tracking").insert({
                    order_id: order.id,
                    status: "pending",
                    note: "Order placed by customer",
                })
            } catch { /* tracking table may not exist yet */ }

            clearCart()

            // Auto complete order instead of showing OTP step
            setSuccess({ orderId: order.id, orderNumber })

        } catch (err: any) {
            toast.error(err.message || "Failed to place order")
        } finally {
            setSubmitting(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (!otpStep || otpInput.length < 4) { toast.error("Enter a valid OTP"); return }
        setVerifying(true)
        try {
            const res = await fetch("/api/orders/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: otpStep.orderNumber, otp: otpInput }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || "Verification failed"); setVerifying(false); return }
            setSuccess({ orderId: otpStep.orderId, orderNumber: otpStep.orderNumber })
            setOtpStep(null)
        } catch { toast.error("Verification failed") }
        finally { setVerifying(false) }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>

    // ── OTP VERIFICATION STEP ──
    if (otpStep) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-[#0a0a0a] p-4">
                <div className="max-w-sm w-full text-center bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl">
                    <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="h-8 w-8 text-amber-600" />
                    </div>
                    <h1 className="text-xl font-extrabold mb-1">Verify Your Order</h1>
                    <p className="text-muted-foreground text-sm mb-4">
                        Enter the OTP sent to your phone to confirm order <span className="font-bold" style={{ color: themeColor }}>{otpStep.orderNumber}</span>
                    </p>

                    <div className="space-y-3">
                        <Input
                            value={otpInput}
                            onChange={e => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter OTP..."
                            className="h-14 text-center text-2xl font-extrabold tracking-[0.5em] rounded-xl"
                            maxLength={6}
                            autoFocus
                        />
                        <Button
                            onClick={handleVerifyOTP}
                            disabled={verifying || otpInput.length < 4}
                            className="w-full h-12 rounded-xl text-white font-bold text-sm"
                            style={{ backgroundColor: themeColor }}
                        >
                            {verifying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</> : "✅ Verify & Confirm Order"}
                        </Button>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-4">
                        Didn&apos;t receive the OTP? Check the notification above or contact the store.
                    </p>
                </div>
            </div>
        )
    }

    // ── SUCCESS PAGE ──
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-[#0a0a0a] p-4">
                <div className="max-w-md w-full text-center bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h1 className="text-2xl font-extrabold mb-2">Order Confirmed! 🎉</h1>
                    <p className="text-muted-foreground text-sm mb-4">ধন্যবাদ! আপনার অর্ডারটি সফল হয়েছে।</p>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Order ID</span>
                            <span className="font-bold" style={{ color: themeColor }}>{success.orderNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-semibold">{name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-semibold">{phone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-extrabold text-lg" style={{ color: themeColor }}>৳{total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl gap-1" onClick={() => window.print()}>
                            <FileText className="h-4 w-4" /> Print
                        </Button>
                        <Link href={`/store/${slug}`} className="flex-1">
                            <Button className="w-full rounded-xl text-white" style={{ backgroundColor: themeColor }}>
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // ── CHECKOUT FORM ──
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
                    <Link href={`/store/${slug}`} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft className="h-5 w-5" /> Back to {seller?.name}
                    </Link>
                    <span className="flex-1 text-center text-lg font-bold">Secure Checkout</span>
                    <div className="w-24" />
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <form className="flex flex-col lg:flex-row gap-8 lg:gap-12" onSubmit={e => e.preventDefault()}>
                    {/* ── LEFT COLUMN: DELIVERY ── */}
                    <div className="flex-1 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <h2 className="text-base font-bold mb-4">Order Summary ({items.length} items)</h2>
                            {items.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-8 text-center bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed">Your cart is empty</p>
                            ) : (
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                                            <div className="h-16 w-16 relative rounded-xl bg-white dark:bg-neutral-800 overflow-hidden shrink-0 shadow-sm">
                                                {item.image ? <Image src={item.image} alt="" fill sizes="64px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{item.name}</p>
                                                {item.variant_label && <p className="text-xs font-medium text-muted-foreground mt-0.5">{item.variant_label}</p>}
                                                <p className="text-sm font-extrabold mt-1" style={{ color: themeColor }}>৳{item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex bg-white dark:bg-neutral-800 items-center gap-1 shrink-0 rounded-lg border shadow-sm p-1">
                                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant_id)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><Minus className="h-3 w-3" /></button>
                                                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant_id)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><Plus className="h-3 w-3" /></button>
                                            </div>
                                            <button type="button" onClick={() => removeItem(item.id, item.variant_id)} className="h-10 w-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-1"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800"><MapPin className="h-5 w-5" style={{ color: themeColor }} /> Delivery Information</h2>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground" /> Full Name <span className="text-red-500">*</span></Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম" className="h-14 rounded-xl text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-1"><Phone className="h-4 w-4 text-muted-foreground" /> Mobile Number <span className="text-red-500">*</span></Label>
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="h-14 rounded-xl text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-200" maxLength={11} />
                                    {phone && !validatePhone(phone) && <p className="text-xs text-red-500 font-medium mt-1">Must be 11 digits starting with 01</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold">Delivery Zone <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {(["dhaka", "outside"] as const).map(z => (
                                        <button key={z} onClick={() => setArea(z)} type="button"
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${area === z ? "text-white font-bold shadow-md" : "bg-neutral-50 dark:bg-neutral-900 border-transparent hover:border-neutral-200"}`}
                                            style={area === z ? { backgroundColor: themeColor, borderColor: themeColor } : {}}>
                                            <p className="text-base font-semibold">{z === "dhaka" ? "📍 Inside Dhaka" : "🚚 Outside Dhaka"}</p>
                                            <p className={`text-sm mt-1 font-medium ${area === z ? "text-white/90" : "text-muted-foreground"}`}>৳{z === "dhaka" ? (settings.delivery_inside ?? 60) : (settings.delivery_outside ?? 120)}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> Full Address <span className="text-red-500">*</span></Label>
                                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="বাড়ি নম্বর, রাস্তা, এলাকা" className="h-14 rounded-xl text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-200" />
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: SUMMARY & PAYMENT ── */}
                    <div className="w-full lg:w-[450px] xl:w-[480px] shrink-0 space-y-6">

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                            <h2 className="text-base font-bold flex items-center gap-2"><CreditCard className="h-5 w-5" style={{ color: themeColor }} /> Payment Method</h2>
                            <div className="space-y-3">
                                {([
                                    { value: "cod" as const, label: "Cash on Delivery", icon: "💵", desc: "Pay the full amount to delivery agent" },
                                    { value: "partial_advance" as const, label: "Partial Advance (ডেলিভারি চার্জ)", icon: "📲", desc: `Pay only ৳${deliveryCharge} advance via bKash/Nagad` },
                                    { value: "full_paid" as const, label: "Full Payment", icon: "✅", desc: "Pay full amount via bKash/Nagad" },
                                ]).map(m => (
                                    <button key={m.value} onClick={() => setPayMethod(m.value)} type="button"
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${payMethod === m.value ? "bg-white dark:bg-neutral-800 shadow-sm" : "bg-neutral-50 dark:bg-neutral-900 border-transparent hover:border-neutral-200"}`}
                                        style={payMethod === m.value ? { borderColor: themeColor } : {}}>
                                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === m.value ? "" : "border-neutral-300"}`} style={payMethod === m.value ? { borderColor: themeColor } : {}}>
                                            {payMethod === m.value && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: themeColor }} />}
                                        </div>
                                        <span className="text-2xl">{m.icon}</span>
                                        <div className="flex-1 text-left">
                                            <p className="text-base font-bold">{m.label}</p>
                                            <p className="text-xs text-muted-foreground">{m.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* bKash/Nagad Payment Details */}
                            {payMethod !== "cod" && (
                                <div className="mt-4 space-y-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                                    <div className="flex gap-3">
                                        {(["bkash", "nagad"] as const).map(p => (
                                            <button key={p} type="button" onClick={() => setPayProvider(p)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${payProvider === p ? "text-white shadow-md" : "bg-white dark:bg-neutral-900 border-neutral-200"}`}
                                                style={payProvider === p ? { backgroundColor: p === "bkash" ? "#E2136E" : "#F6921E", borderColor: p === "bkash" ? "#E2136E" : "#F6921E" } : {}}>
                                                {p === "bkash" ? "bKash" : "Nagad"}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border text-center space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Send <span className="font-extrabold text-foreground text-lg">৳{advanceAmount.toLocaleString()}</span> to</p>
                                        <p className="text-2xl font-extrabold tracking-wide" style={{ color: payProvider === "bkash" ? "#E2136E" : "#F6921E" }}>
                                            {payProvider === "bkash" ? (settings.bkash_number || seller?.bkash_number || "01XXXXXXXXX") : (settings.nagad_number || seller?.nagad_number || "01XXXXXXXXX")}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">(Personal/{payProvider === "bkash" ? "bKash" : "Nagad"} Send Money)</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-bold">TrxID <span className="text-red-500">*</span></Label>
                                            <Input value={trxId}
                                                onChange={e => setTrxId(e.target.value.toUpperCase().replace(/\s/g, ""))}
                                                placeholder="Enter TrxID (e.g. 8AB3X9Y)"
                                                className="h-14 rounded-xl text-base bg-white dark:bg-neutral-900 border-neutral-200 font-mono tracking-widest text-center font-bold uppercase" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-bold">Sender Number</Label>
                                            <Input value={senderNumber}
                                                onChange={e => setSenderNumber(e.target.value)}
                                                placeholder="01XXXXXXXXX"
                                                className="h-14 rounded-xl text-base bg-white dark:bg-neutral-900 border-neutral-200 text-center" maxLength={11} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Promo Code */}
                        <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                            <h2 className="text-base font-bold flex items-center gap-2 text-amber-500"><span className="text-lg">🎟️</span> Apply Promo Code</h2>
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="text-base font-bold text-green-700 dark:text-green-400 font-mono tracking-wider">{appliedCoupon.code}</span>
                                    </div>
                                    <button type="button" onClick={() => setAppliedCoupon(null)} className="text-sm text-muted-foreground hover:text-red-500 font-bold px-2">Remove</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                                        placeholder="Enter code"
                                        className="h-14 rounded-xl text-base bg-neutral-50 dark:bg-neutral-900 border-neutral-200 font-mono tracking-widest uppercase font-bold text-center"
                                    />
                                    <Button type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon || !couponCode}
                                        className="h-14 px-8 rounded-xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 text-base"
                                    >
                                        {applyingCoupon ? <Loader2 className="h-5 w-5 animate-spin" /> : "Apply"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Bill Summary */}
                        <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                            <div className="flex justify-between text-base"><span className="text-muted-foreground font-medium">Subtotal</span><span className="font-bold">৳{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-base"><span className="text-muted-foreground font-medium">Delivery</span><span className="font-bold">৳{deliveryCharge}</span></div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-base text-green-600 dark:text-green-400">
                                    <span className="font-bold flex items-center gap-2">Discount ({appliedCoupon?.code})</span>
                                    <span className="font-bold">-৳{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-2 flex justify-between items-center">
                                <span className="font-bold text-lg">Total Bill</span>
                                <span className="text-3xl font-extrabold" style={{ color: themeColor }}>৳{total.toLocaleString()}</span>
                            </div>
                            {payMethod !== "cod" && (
                                <>
                                    <div className="flex justify-between text-base text-blue-600 dark:text-blue-400">
                                        <span className="font-bold">Advance ({payMethod === "partial_advance" ? "Delivery Charge" : "Full"})</span>
                                        <span className="font-bold">৳{advanceAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl -mx-2">
                                        <span className="font-extrabold text-amber-700 dark:text-amber-400">Due on Delivery</span>
                                        <span className="font-extrabold text-xl text-amber-700 dark:text-amber-400">৳{dueAmount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Submit */}
                        <Button type="button"
                            onClick={handleOrder}
                            disabled={submitting}
                            className="w-full h-16 rounded-2xl font-extrabold text-lg text-white shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 transition-all gap-3 mt-4"
                            style={{ backgroundColor: themeColor }}
                        >
                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                            {submitting ? "Processing..." : `Confirm Order — ৳${total.toLocaleString()}`}
                        </Button>

                        <div className="flex justify-center gap-6 text-sm font-semibold text-muted-foreground pt-4">
                            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" style={{ color: themeColor }} /> Fast Delivery</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: themeColor }} /> Secure Checkout</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function StoreCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    return (
        <StoreCartProvider slug={slug}>
            <CheckoutInner slug={slug} />
        </StoreCartProvider>
    )
}
