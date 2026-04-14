import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addScore, getUserScores, updateScore } from '@/lib/score-engine'

// GET /api/scores - get current user's scores
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const scores = await getUserScores(user.id)
    return NextResponse.json({ scores })
}

// POST /api/scores - add a new score
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check active subscription
    const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

    if (!sub) {
        return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const body = await request.json()
    const { score, played_at } = body

    if (!score || !played_at) {
        return NextResponse.json({ error: 'score and played_at are required' }, { status: 400 })
    }

    const result = await addScore(user.id, Number(score), played_at)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })

    return NextResponse.json({ score: result.data }, { status: 201 })
}

// DELETE /api/scores?id=... - delete a score
export async function DELETE(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Score id is required' }, { status: 400 })

    // Use adminSupabase to bypass RLS, but verify ownership first
    const { adminSupabase } = await import('@/lib/supabase/admin')
    const { data: score } = await adminSupabase
        .from('scores')
        .select('user_id')
        .eq('id', id)
        .single()

    if (!score || score.user_id !== user.id) {
        return NextResponse.json({ error: 'Score not found' }, { status: 404 })
    }

    const { error } = await adminSupabase.from('scores').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
}
