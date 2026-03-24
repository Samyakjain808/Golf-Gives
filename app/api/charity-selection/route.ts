import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

// GET /api/charity-selection
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await adminSupabase
        .from('user_charity_selections')
        .select('*, charity:charities(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

    return NextResponse.json({ selection: data })
}

// POST /api/charity-selection - create or update charity selection
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { charity_id, contribution_pct } = body

    if (!charity_id) return NextResponse.json({ error: 'charity_id is required' }, { status: 400 })
    const pct = Number(contribution_pct ?? 10)
    if (pct < 10 || pct > 100) {
        return NextResponse.json({ error: 'Contribution % must be between 10 and 100' }, { status: 400 })
    }

    // Deactivate previous selections
    await adminSupabase
        .from('user_charity_selections')
        .update({ is_active: false })
        .eq('user_id', user.id)

    // Insert new selection
    const { data, error } = await adminSupabase
        .from('user_charity_selections')
        .insert({ user_id: user.id, charity_id, contribution_pct: pct, is_active: true })
        .select('*, charity:charities(*)')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ selection: data })
}
