// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/sellers/[id]/rollback-theme — Rollback to previous theme
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sellerId } = await params
        const token = req.headers.get('authorization')?.replace('Bearer ', '') || ''
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        })

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Verify ownership
        const { data: seller } = await supabase
            .from('sellers')
            .select('id, user_id, active_theme_id')
            .eq('id', sellerId)
            .single()

        if (!seller || seller.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Find previous theme from history
        const { data: history } = await supabase
            .from('theme_history')
            .select('*')
            .eq('seller_id', sellerId)
            .eq('action', 'applied')
            .order('applied_at', { ascending: false })
            .limit(2)

        if (!history || history.length < 2) {
            return NextResponse.json({ error: 'No previous theme to rollback to' }, { status: 400 })
        }

        const previousEntry = history[1]
        const previousThemeId = previousEntry.theme_id

        // Apply previous theme
        await supabase
            .from('sellers')
            .update({ active_theme_id: previousThemeId })
            .eq('id', sellerId)

        // Record rollback in history
        await supabase.from('theme_history').insert({
            seller_id: sellerId,
            theme_id: previousThemeId,
            action: 'reverted',
            snapshot: { reverted_from: seller.active_theme_id },
        })

        // Audit log
        await supabase.from('audit_logs').insert({
            seller_id: sellerId,
            user_id: session.user.id,
            action: 'theme_rollback',
            metadata: { from: seller.active_theme_id, to: previousThemeId },
        })

        return NextResponse.json({
            success: true,
            message: 'Rolled back to previous theme',
            previousThemeId,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
