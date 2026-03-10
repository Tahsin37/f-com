// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/themes/generate — AI prompt → ThemeJSON
// Uses a mock resolver (plug real API keys for production)
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateThemeFromPrompt } from '@/lib/theme/ai-resolver'

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
        const { prompt } = body

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
            return NextResponse.json({ error: 'Provide a theme prompt (min 3 characters)' }, { status: 400 })
        }

        // Rate limiting check (simple: max 10 per hour per seller)
        const { data: seller } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

        if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { count } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', seller.id)
            .eq('action', 'theme_ai_generate')
            .gte('created_at', oneHourAgo)

        if ((count || 0) >= 10) {
            return NextResponse.json({
                error: 'Rate limit exceeded. Max 10 AI generations per hour.',
            }, { status: 429 })
        }

        // Generate theme
        const result = generateThemeFromPrompt(prompt)

        // Audit log
        await supabase.from('audit_logs').insert({
            seller_id: seller.id,
            user_id: session.user.id,
            action: 'theme_ai_generate',
            metadata: { prompt: prompt.substring(0, 200) },
        })

        return NextResponse.json(result)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
