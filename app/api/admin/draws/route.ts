import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
    return data?.role === 'admin' ? user : null
}

// GET /api/admin/draws
export async function GET() {
    const adminUser = await checkAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await adminSupabase
        .from('draws')
        .select('*, prizes(*)')
        .order('draw_month', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ draws: data })
}

// POST /api/admin/draws - create a pending draw for a month
export async function POST(request: NextRequest) {
    const adminUser = await checkAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { draw_month } = body // YYYY-MM-01 format ideally

    const { data, error } = await adminSupabase
        .from('draws')
        .insert({ draw_month, status: 'pending' })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ draw: data }, { status: 201 })
}
