// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/sellers/[id]/apply-theme — Apply a theme to a seller's store
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

        const body = await req.json()
        const { themeId } = body

        if (!themeId) {
            return NextResponse.json({ error: 'themeId required' }, { status: 400 })
        }

        // Verify theme exists and is owned by seller
        const { data: theme } = await supabase
            .from('themes')
            .select('id, status, name')
            .eq('id', themeId)
            .eq('seller_id', sellerId)
            .single()

        if (!theme) {
            return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
        }

        if (theme.status === 'pending_review') {
            return NextResponse.json({ error: 'Theme is pending admin review' }, { status: 403 })
        }

        if (theme.status === 'rejected') {
            return NextResponse.json({ error: 'Theme was rejected by admin' }, { status: 403 })
        }

        // Save to theme history (for rollback)
        await supabase.from('theme_history').insert({
            seller_id: sellerId,
            theme_id: themeId,
            action: 'applied',
            snapshot: { previous_theme_id: seller.active_theme_id },
        })

        // Apply theme
        const { error } = await supabase
            .from('sellers')
            .update({ active_theme_id: themeId })
            .eq('id', sellerId)

        if (error) throw error

        // Mark theme as active
        await supabase
            .from('themes')
            .update({ status: 'active' })
            .eq('id', themeId)

        // If there was a previous active theme, set it back to approved
        if (seller.active_theme_id && seller.active_theme_id !== themeId) {
            await supabase
                .from('themes')
                .update({ status: 'approved' })
                .eq('id', seller.active_theme_id)
        }

        // Audit log
        await supabase.from('audit_logs').insert({
            seller_id: sellerId,
            user_id: session.user.id,
            action: 'theme_applied',
            resource: themeId,
            metadata: { themeName: theme.name },
            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
        })

        return NextResponse.json({
            success: true,
            message: `Theme "${theme.name}" applied successfully`,
        }, {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
