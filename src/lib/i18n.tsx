"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import en from "@/locales/en.json"
import bn from "@/locales/bn.json"

type Locale = "en" | "bn"
type Dictionary = Record<string, string>

interface I18nContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
}

const dictionaries: Record<Locale, Dictionary> = {
    en,
    bn,
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en")

    useEffect(() => {
        const stored = localStorage.getItem("fmanager_locale") as Locale
        if (stored && (stored === "en" || stored === "bn")) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocaleState(stored)
        }
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem("fmanager_locale", newLocale)
    }

    const t = (key: string): string => {
        return dictionaries[locale][key] || key
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider")
    }
    return context
}
