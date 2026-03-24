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
