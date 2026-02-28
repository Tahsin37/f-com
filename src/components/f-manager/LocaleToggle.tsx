"use client"

import * as React from "react"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export function LocaleToggle() {
    const { locale, setLocale } = useTranslation()

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="rounded-full font-medium"
        >
            {locale === "en" ? "বাংলা" : "English"}
            <span className="sr-only">Toggle language</span>
        </Button>
    )
}
