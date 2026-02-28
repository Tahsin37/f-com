"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface OTPInputProps {
    length?: number
    onVerify: (otp: string) => void
    onResend?: () => void
}

export function OTPInput({ length = 4, onVerify, onResend }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""))
    const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const [timer, setTimer] = useState(60)

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value
        if (isNaN(Number(value))) return

        const newOTP: string[] = [...otp]
        newOTP[index] = value.substring(value.length - 1)
        setOtp(newOTP)

        if (value && index < length - 1) {
            setActiveOTPIndex(index + 1)
        }

        if (newOTP.every((val) => val !== "")) {
            onVerify(newOTP.join(""))
        }
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            e.preventDefault()
            const newOTP = [...otp]
            newOTP[index] = ""
            setOtp(newOTP)
            if (index > 0) setActiveOTPIndex(index - 1)
        }
    }

    useEffect(() => {
        inputRef.current?.focus()
    }, [activeOTPIndex])

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex space-x-2 sm:space-x-4">
                {otp.map((_, index) => (
                    <React.Fragment key={index}>
                        <Input
                            ref={index === activeOTPIndex ? inputRef : null}
                            type="text"
                            inputMode="numeric"
                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-teal-500 rounded-xl transition-all shadow-sm"
                            value={otp[index]}
                            onChange={(e) => handleOnChange(e, index)}
                            onKeyDown={(e) => handleOnKeyDown(e, index)}
                            aria-label={`Digit ${index + 1}`}
                        />
                    </React.Fragment>
                ))}
            </div>

            <div className="text-sm text-center">
                {timer > 0 ? (
                    <p className="text-muted-foreground animate-in fade-in duration-300">
                        Resend code in <span className="font-bold text-foreground">{timer}s</span>
                    </p>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setTimer(60)
                            setOtp(new Array(length).fill(""))
                            setActiveOTPIndex(0)
                            onResend?.()
                        }}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/50"
                    >
                        Resend Code
                    </Button>
                )}
            </div>
        </div>
    )
}
