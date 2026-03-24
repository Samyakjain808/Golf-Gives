import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

// GET /api/charities/[id]
export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { data, error } = await adminSupabase
        .from('charities')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

    if (error || !data) return NextResponse.json({ error: 'Charity not found' }, { status: 404 })
    return NextResponse.json({ charity: data })
}
