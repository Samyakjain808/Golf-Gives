import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

// GET /api/charities - list charities with search and filter
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const category = searchParams.get('category') ?? ''
    const country = searchParams.get('country') ?? ''

    let query = adminSupabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name')

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (country) query = query.eq('country', country)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ charities: data })
}
