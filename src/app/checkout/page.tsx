"use client"

import React, { useState } from "react"
import { useCart } from "@/lib/CartContext"
import { Header } from "@/components/f-manager/Header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OTPInput } from "@/components/f-manager/OTPInput"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n"
import { CheckCircle2, ChevronLeft, ShieldCheck, Printer, Share2, MapPin, CreditCard, Banknote, Smartphone, AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

type CheckoutStep = "details" | "payment" | "otp" | "success"
type DeliveryArea = "dhaka" | "outside"
type PaymentMethod = "cod" | "bkash" | "nagad"

const DELIVERY_CHARGE: Record<DeliveryArea, number> = {
    dhaka: 60,
    outside: 120,
}

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart()
    const [step, setStep] = useState<CheckoutStep>("details")
    const [formData, setFormData] = useState({ name: "", phone: "", address: "" })
    const [area, setArea] = useState<DeliveryArea>("dhaka")
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
    const [trxId, setTrxId] = useState("")
    const { t } = useTranslation()
    const router = useRouter()

    const deliveryCharge = DELIVERY_CHARGE[area]
    const grandTotal = totalPrice + deliveryCharge

    // Generate Order ID on mount to keep render pure
    const [orderId, setOrderId] = useState("")
    React.useEffect(() => {
        setOrderId(`FM-${Math.floor(10000 + Math.random() * 90000)}`)
    }, [])

    // Step Progress
    const steps: { key: CheckoutStep; label: string }[] = [
        { key: "details", label: t("checkout.step.details") },
        { key: "payment", label: t("checkout.step.payment") },
        { key: "otp", label: "OTP" },
        { key: "success", label: "Done" },
    ]
    const currentIdx = steps.findIndex((s) => s.key === step)

    const [isBlacklisted, setIsBlacklisted] = useState(false)
    const [demoOtp, setDemoOtp] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [verifying, setVerifying] = useState(false)

    const handleDetailsNext = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Please fill in all details.")
            return
        }
        if (formData.phone.length < 11) {
            toast.error("Please enter a valid 11-digit phone number.")
            return
        }
        setStep("payment")
    }

    const handlePaymentNext = async () => {
        if (paymentMethod !== "cod" && !trxId) {
            toast.error("Please enter your Transaction ID.")
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        id: item.id,
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    customer: {
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                    },
                    payment: {
                        method: paymentMethod,
                        trxId: trxId || null,
                    },
                    deliveryArea: area,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setOrderId(data.orderId)
            setIsBlacklisted(data.isBlacklisted)
            setDemoOtp(data._demoOtp || "")
            setStep("otp")
            toast.info(`OTP sent to ${formData.phone}`, {
                description: `Demo OTP: ${data._demoOtp}`,
                duration: 15000,
            })
        } catch (err: any) {
            toast.error(err.message || "Failed to place order")
        } finally {
            setSubmitting(false)
        }
    }

    const handleVerifyOTP = async (otp: string) => {
        if (otp.length !== 4) {
            toast.error("Please enter the 4-digit OTP")
            return
        }
        setVerifying(true)
        try {
            const res = await fetch("/api/orders/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success("Order Confirmed!")
            setStep("success")
            clearCart()
        } catch (err: any) {
            toast.error(err.message || "Invalid OTP")
        } finally {
            setVerifying(false)
        }
    }

    if (cart.length === 0 && step !== "success") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pb-24">
            <Header />

            <main className="container max-w-lg mt-8 px-4">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <div className="flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= currentIdx
                                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/30"
                                    : "bg-neutral-200 dark:bg-neutral-800 text-muted-foreground"
                                    }`}>
                                    {i < currentIdx ? "✓" : i + 1}
                                </div>
                                <span className={`text-[11px] mt-1.5 font-medium ${i <= currentIdx ? "text-teal-600" : "text-muted-foreground"}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${i < currentIdx ? "bg-teal-500" : "bg-neutral-200 dark:bg-neutral-800"
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* STEP 1: Details */}
                {step === "details" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-extrabold">{t("checkout.title")}</h1>
                        </div>

                        <Card className="rounded-3xl border-neutral-200/50 dark:border-neutral-800/50 shadow-xl overflow-hidden bg-white dark:bg-neutral-900 border-t-4 border-t-teal-500">
                            <CardContent className="p-6">
                                <p className="text-sm text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-950/50 p-3 rounded-xl mb-6 flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 shrink-0" />
                                    {t("checkout.hint")}
                                </p>

                                <form onSubmit={handleDetailsNext} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Full Name *</label>
                                        <Input
                                            required placeholder="e.g. Rakib Hasan" value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-neutral-950"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Phone Number *</label>
                                        <Input
                                            required type="tel" placeholder="01XXXXXXXXX" value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-neutral-950"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Delivery Address *</label>
                                        <Input
                                            required placeholder="House, Road, Area" value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-neutral-950"
                                        />
                                    </div>

                                    {/* Delivery Area */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-teal-600" /> Delivery Area *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {([
                                                { value: "dhaka" as DeliveryArea, label: "ঢাকা (Inside Dhaka)", charge: 60 },
                                                { value: "outside" as DeliveryArea, label: "ঢাকার বাইরে (Outside)", charge: 120 },
                                            ]).map((opt) => (
                                                <button
                                                    type="button"
                                                    key={opt.value}
                                                    onClick={() => setArea(opt.value)}
                                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-center active:scale-95 ${area === opt.value
                                                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/50 shadow-sm"
                                                        : "border-neutral-200 dark:border-neutral-800"
                                                        }`}
                                                >
                                                    <span className="text-sm font-semibold">{opt.label}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">৳ {opt.charge}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t mt-6 flex justify-between items-center bg-slate-50 dark:bg-neutral-950 p-4 rounded-2xl">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Subtotal + Delivery</span>
                                            <span className="font-extrabold text-xl">৳ {grandTotal.toLocaleString()}</span>
                                        </div>
                                        <Button type="submit" size="lg" className="rounded-xl font-bold px-8 shadow-md bg-teal-600 hover:bg-teal-700 text-white">
                                            Next
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* STEP 2: Payment */}
                {step === "payment" && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="mb-6 flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => setStep("details")} className="mr-2">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-extrabold">{t("checkout.step.payment")}</h1>
                        </div>

                        <Card className="rounded-3xl border-neutral-200/50 dark:border-neutral-800/50 shadow-xl overflow-hidden bg-white dark:bg-neutral-900 border-t-4 border-t-teal-500">
                            <CardContent className="p-6">
                                <p className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                    Select Payment Method
                                </p>

                                <div className="space-y-3">
                                    {([
                                        { value: "cod" as PaymentMethod, label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
                                        { value: "bkash" as PaymentMethod, label: "bKash", icon: Smartphone, desc: "Send to: 01XXXXXXXXX" },
                                        { value: "nagad" as PaymentMethod, label: "Nagad", icon: CreditCard, desc: "Send to: 01XXXXXXXXX" },
                                    ]).map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setPaymentMethod(opt.value)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98] ${paymentMethod === opt.value
                                                ? "border-teal-500 bg-teal-50 dark:bg-teal-950/50 shadow-sm"
                                                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                                }`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${paymentMethod === opt.value ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-neutral-800 text-muted-foreground"
                                                }`}>
                                                <opt.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{opt.label}</div>
                                                <div className="text-xs text-muted-foreground">{opt.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod !== "cod" && (
                                    <div className="mt-6 space-y-2 animate-in fade-in duration-300">
                                        <label className="text-sm font-semibold">Transaction ID (TrxID) *</label>
                                        <Input
                                            placeholder="e.g. TRX123456789"
                                            value={trxId}
                                            onChange={(e) => setTrxId(e.target.value)}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-neutral-950"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Send ৳ {grandTotal.toLocaleString()} to the number above, then paste your TrxID here.
                                        </p>
                                    </div>
                                )}

                                <Separator className="my-6" />

                                {/* Order Summary */}
                                <div className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-2xl space-y-2 text-sm">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between">
                                            <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                                            <span className="font-medium">৳ {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Delivery ({area === "dhaka" ? "ঢাকা" : "ঢাকার বাইরে"})</span>
                                        <span>৳ {deliveryCharge}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-extrabold text-base">
                                        <span>Grand Total</span>
                                        <span className="text-teal-600">৳ {grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePaymentNext}
                                    size="lg"
                                    className="w-full mt-6 rounded-xl font-bold h-14 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                                >
                                    Confirm & Send OTP
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* STEP 3: OTP */}
                {step === "otp" && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-sm mx-auto mt-12 text-center">
                        <h2 className="text-2xl font-extrabold mb-2">Verify Phone</h2>
                        <p className="text-muted-foreground mb-8 text-sm">
                            We&apos;ve sent a 4-digit code to <br />
                            <span className="font-bold text-foreground">{formData.phone}</span>
                        </p>
                        <OTPInput length={4} onVerify={handleVerifyOTP} />
                        <Button variant="ghost" onClick={() => setStep("payment")} className="mt-8 text-sm">
                            Go Back
                        </Button>
                    </div>
                )}

                {/* STEP 4: Receipt */}
                {step === "success" && (
                    <div className="animate-in zoom-in-95 duration-500 mt-8 text-center">
                        <CheckCircle2 className="w-20 h-20 text-teal-500 mx-auto mb-4 animate-in zoom-in-50 duration-700" />
                        <h2 className="text-3xl font-extrabold mb-2">Order Confirmed!</h2>
                        <p className="text-muted-foreground mb-8 text-sm">
                            Thank you, <b>{formData.name}</b>. Your order ID is <b>{orderId}</b>.
                        </p>

                        <Card className="max-w-sm mx-auto text-left shadow-xl overflow-hidden border-t-8 border-t-teal-500 rounded-3xl">
                            {/* Receipt Header */}
                            <div className="bg-slate-50 dark:bg-neutral-900 px-6 py-4 border-b flex justify-between items-center">
                                <div>
                                    <div className="font-extrabold text-lg">F-Manager</div>
                                    <div className="text-xs text-muted-foreground">Digital Invoice</div>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{orderId}</span>
                            </div>

                            <CardContent className="p-6 space-y-4">
                                {/* Customer Info */}
                                <div className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Customer:</span> <b>{formData.name}</b></p>
                                    <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
                                    <p><span className="text-muted-foreground">Address:</span> {formData.address}</p>
                                    <p><span className="text-muted-foreground">Area:</span> {area === "dhaka" ? "ঢাকা" : "ঢাকার বাইরে"}</p>
                                </div>

                                <Separator />

                                {/* Items */}
                                <div className="space-y-2 text-sm">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className="font-medium">৳ {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Delivery Charge</span>
                                        <span>৳ {deliveryCharge}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-extrabold text-base">
                                        <span>Grand Total</span>
                                        <span className="text-teal-600">৳ {grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* AWB & Payment */}
                                <div className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Payment:</span> <b>{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod.toUpperCase()}</b></p>
                                    {trxId && <p><span className="text-muted-foreground">TrxID:</span> {trxId}</p>}
                                    <p><span className="text-muted-foreground">AWB:</span> <span className="text-xs italic">Pending courier booking</span></p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.print()}>
                                        <Printer className="w-4 h-4 mr-2" /> Print
                                    </Button>
                                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        toast.success("Link copied!")
                                    }}>
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                </div>

                                <Button className="w-full rounded-2xl mt-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => router.push(`/invoice/${orderId}`)}>
                                    View Full Invoice
                                </Button>
                                <Button variant="outline" className="w-full rounded-2xl" onClick={() => router.push("/")}>
                                    Back to Home
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
