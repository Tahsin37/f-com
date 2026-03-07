"use client"

import React from "react"

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

/**
 * Global Error Boundary — catches runtime errors and shows
 * a production-friendly error screen instead of a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log to console in development only
        if (process.env.NODE_ENV === "development") {
            console.error("ErrorBoundary caught:", error, info)
        }
        // In production, you could send to an error tracking service here
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground mb-2">Something went wrong</h1>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            An unexpected error occurred. Please refresh the page or try again later.
                        </p>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="text-left bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-6 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.reload()
                            }}
                            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
