import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { executeDraw } from '@/lib/draw-engine'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
    return data?.role === 'admin' ? user : null
}

// POST /api/admin/draws/[id]/publish
// Locks draw results and creates winner records.
// Does NOT make the draw visible to users — use /make-visible for that.
export async function POST(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminUser = await checkAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    // Ensure not already published or visible
    const { data: draw } = await adminSupabase.from('draws').select('status, draw_month').eq('id', id).single()
    if (draw?.status === 'published' || draw?.status === 'visible') {
        return NextResponse.json({ error: 'Already published' }, { status: 400 })
    }

    const { data: config } = await adminSupabase.from('draw_config').select('*').single()
    if (!config) return NextResponse.json({ error: 'System config missing' }, { status: 500 })

    // Execute and persist — locks results, creates winner records
    const result = await executeDraw(id, config, false)

    await adminSupabase
        .from('draws')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)

    // Emails are NOT sent here — they are sent when admin makes the draw visible
    // via POST /api/admin/draws/[id]/make-visible

    return NextResponse.json({ success: true, draw: result })
}
