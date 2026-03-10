// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/themes — List seller's themes
// POST /api/themes — Create theme from validated JSON
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateThemeJSON } from '@/lib/theme/schema'
import { sanitizeCSS } from '@/lib/theme/css-sanitizer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabaseClient(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
    return createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    })
}

// GET — list seller's themes
export async function GET(req: NextRequest) {
    try {
        const supabase = getSupabaseClient(req)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: seller } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

        if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

        const { data: themes, error } = await supabase
            .from('themes')
            .select('*')
            .eq('seller_id', seller.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ themes })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// POST — create theme from JSON
export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseClient(req)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: seller } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

        if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

        const body = await req.json()
        const themeJson = body.themeJson || body

        // Validate
        const validation = validateThemeJSON(themeJson)
        if (!validation.valid) {
            return NextResponse.json({ error: 'Invalid theme', details: validation.errors }, { status: 400 })
        }

        // Sanitize CSS if present
        let safeCss = ''
        let riskScore = 0
        if (themeJson.safeCSS) {
            const cssResult = sanitizeCSS(themeJson.safeCSS)
            safeCss = cssResult.css
            riskScore = cssResult.riskScore
        }

        const status = riskScore > 20 ? 'pending_review' : 'draft'

        // Insert
        const { data: theme, error } = await supabase.from('themes').insert({
            seller_id: seller.id,
            name: themeJson.name,
            slug: themeJson.id,
            author: themeJson.author || 'Custom',
            version: themeJson.version || '1.0.0',
            preview_image: themeJson.previewImage || null,
            tokens: themeJson.tokens,
            components: themeJson.components,
            assets: themeJson.assets || {},
            safe_css: safeCss,
            status,
            risk_score: riskScore,
            source: body.source || 'manual',
        }).select().single()

        if (error) throw error

        // Audit log
        await supabase.from('audit_logs').insert({
            seller_id: seller.id,
            user_id: session.user.id,
            action: 'theme_created',
            resource: theme.id,
            metadata: { name: themeJson.name, source: body.source || 'manual', riskScore },
        })

        return NextResponse.json({ theme, validation }, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
