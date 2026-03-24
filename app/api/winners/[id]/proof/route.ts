import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

// POST /api/winners/[id]/proof - submit proof URL
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { proof_url } = body

    if (!proof_url) {
        return NextResponse.json({ error: 'proof_url is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: winner } = await adminSupabase
        .from('winners')
        .select('user_id, verification_status')
        .eq('id', id)
        .single()

    if (!winner || winner.user_id !== user.id) {
        return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    if (winner.verification_status === 'approved') {
        return NextResponse.json({ error: 'Already verified' }, { status: 400 })
    }

    const { error } = await adminSupabase
        .from('winners')
        .update({ proof_url, verification_status: 'pending' }) // allow re-upload if rejected
        .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
