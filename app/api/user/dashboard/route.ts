import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { isEligibleForDraw } from '@/lib/score-engine'

// GET /api/user/dashboard - full dashboard data for current user
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
        profileRes, subscriptionRes, scoresRes, charitySelRes, drawRes, winnersRes
    ] = await Promise.all([
        adminSupabase.from('profiles').select('*').eq('id', user.id).single(),
        adminSupabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        adminSupabase.from('scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        adminSupabase.from('user_charity_selections').select('*, charity:charities(*)').eq('user_id', user.id).eq('is_active', true).single(),
        adminSupabase.from('draws').select('*').eq('status', 'published').order('draw_month', { ascending: false }).limit(1).single(),
        adminSupabase.from('winners').select('*, draw:draws(draw_month, drawn_numbers)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])

    const latestDraw = drawRes.data
    let myEntry = null
    if (latestDraw) {
        const { data: entry } = await adminSupabase
            .from('draw_entries')
            .select('*')
            .eq('draw_id', latestDraw.id)
            .eq('user_id', user.id)
            .single()
        myEntry = entry
    }

    const eligible = await isEligibleForDraw(user.id)

    return NextResponse.json({
        profile: profileRes.data,
        subscription: subscriptionRes.data,
        scores: scoresRes.data ?? [],
        charitySelection: charitySelRes.data,
        recentDraw: latestDraw,
        myEntry,
        winnings: winnersRes.data ?? [],
        eligibleForDraw: eligible,
    })
}
