// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/themes/import-html — Parse HTML+CSS into ThemeJSON
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseHTMLToTheme } from '@/lib/theme/html-parser'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        })

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { html = '', css = '', themeName, author } = body

        if (!html && !css) {
            return NextResponse.json({ error: 'Provide at least HTML or CSS' }, { status: 400 })
        }

        const result = parseHTMLToTheme(html, css, {
            themeName: themeName || 'Imported Theme',
            author: author || session.user.email || 'Import',
        })

        // Audit log
        const { data: seller } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

        if (seller) {
            await supabase.from('audit_logs').insert({
                seller_id: seller.id,
                user_id: session.user.id,
                action: 'theme_import_html',
                metadata: {
                    success: result.success,
                    riskScore: result.riskScore,
                    blocked: result.blocked.length,
                },
            })
        }

        return NextResponse.json(result)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
