import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { executeDraw } from '@/lib/draw-engine'
import { sendDrawResultEmail, sendWinnerAlertEmail } from '@/lib/email'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
    return data?.role === 'admin' ? user : null
}

// POST /api/admin/draws/[id]/publish
export async function POST(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminUser = await checkAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    // Ensure not already published
    const { data: draw } = await adminSupabase.from('draws').select('status, draw_month').eq('id', id).single()
    if (draw?.status === 'published') {
        return NextResponse.json({ error: 'Already published' }, { status: 400 })
    }

    const { data: config } = await adminSupabase.from('draw_config').select('*').single()
    if (!config) return NextResponse.json({ error: 'System config missing' }, { status: 500 })

    // Execute and persist
    const result = await executeDraw(id, config, false)

    await adminSupabase
        .from('draws')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)

    // Notify all participants asynchronously
    const { data: entries } = await adminSupabase
        .from('draw_entries')
        .select('*, profile:profiles(email, full_name)')
        .eq('draw_id', id)

    if (entries) {
        const monthStr = new Date(draw!.draw_month).toLocaleString('en-IE', { month: 'long', year: 'numeric' })

        // Fire and forget email sends
        Promise.all(entries.map(async (entry: any) => {
            if (!entry.profile?.email) return

            // Determine prize if winner
            let prizeCents = 0
            if (entry.match_count >= 3) {
                const prizeTier = result.prizes.find(p => p.tier === entry.match_count)
                prizeCents = prizeTier?.perWinnerCents ?? 0
            }

            await sendDrawResultEmail({
                to: entry.profile.email,
                name: entry.profile.full_name ?? 'Subscriber',
                drawMonth: monthStr,
                drawnNumbers: result.drawnNumbers,
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

    return NextResponse.json({ success: true, draw: result })
}
