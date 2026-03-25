import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Temporary debug route - remove after fixing
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Try reading subscription WITHOUT status filter
    const { data: allSubs, error: allErr } = await supabase
        .from('subscriptions')
        .select('id, user_id, status, plan, current_period_end')
        .eq('user_id', user.id)

    // Try reading WITH status filter (what dashboard does)
    const { data: activeSub, error: activeErr } = await supabase
        .from('subscriptions')
        .select('id, status, plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

    return NextResponse.json({
        userId: user.id,
        email: user.email,
        allSubscriptions: allSubs,
        allError: allErr?.message,
        activeSubscription: activeSub,
        activeError: activeErr?.message,
    })
}
