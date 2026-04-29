import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { sendDrawResultEmail, sendWinnerAlertEmail } from '@/lib/email'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
    return data?.role === 'admin' ? user : null
}

// POST /api/admin/draws/[id]/make-visible
export async function POST(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminUser = await checkAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    // Ensure draw is currently 'published' (results locked but not yet user-visible)
    const { data: draw } = await adminSupabase
        .from('draws')
        .select('status, draw_month, drawn_numbers, prize_pool_cents, jackpot_cents')
        .eq('id', id)
        .single()

    if (!draw) {
        return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    if (draw.status === 'visible') {
        return NextResponse.json({ error: 'Already visible to users' }, { status: 400 })
    }

    if (draw.status !== 'published') {
        return NextResponse.json({ error: 'Draw must be published before making visible. Current status: ' + draw.status }, { status: 400 })
    }

    // Update status to visible
    const { error: updateError } = await adminSupabase
        .from('draws')
        .update({ status: 'visible', visible_at: new Date().toISOString() })
        .eq('id', id)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Now send notification emails to all participants
    const { data: entries } = await adminSupabase
        .from('draw_entries')
        .select('*, profile:profiles(email, full_name)')
        .eq('draw_id', id)

    const { data: prizes } = await adminSupabase
        .from('prizes')
        .select('match_tier, total_cents, winner_count')
        .eq('draw_id', id)

    if (entries) {
        const monthStr = new Date(draw.draw_month).toLocaleString('en-IE', { month: 'long', year: 'numeric' })

        // Fetch winner records for prize amounts
        const { data: winners } = await adminSupabase
            .from('winners')
            .select('user_id, match_tier, prize_cents')
            .eq('draw_id', id)

        const winnerMap = new Map(winners?.map(w => [w.user_id, w]) ?? [])

        // Fire and forget email sends
        Promise.all(entries.map(async (entry: any) => {
            if (!entry.profile?.email) return

            const winner = winnerMap.get(entry.user_id)
            const prizeCents = winner?.prize_cents ?? 0

            await sendDrawResultEmail({
                to: entry.profile.email,
                name: entry.profile.full_name ?? 'Subscriber',
                drawMonth: monthStr,
                drawnNumbers: draw.drawn_numbers,
                userNumbers: entry.entry_numbers,
                matchCount: entry.match_count,
                prizeCents: prizeCents > 0 ? prizeCents : undefined,
            }).catch(console.error)

            if (prizeCents > 0) {
                await sendWinnerAlertEmail({
                    to: entry.profile.email,
                    name: entry.profile.full_name ?? 'Winner',
                    prizeCents,
                    drawMonth: monthStr,
                }).catch(console.error)
            }
        })).catch(console.error)
    }

    return NextResponse.json({ success: true })
}
