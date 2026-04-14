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

// POST /api/admin/draws/[id]/simulate
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminUser = await checkAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    const { data: config } = await adminSupabase.from('draw_config').select('*').single()
    if (!config) return NextResponse.json({ error: 'System config missing' }, { status: 500 })

    // Read the generation method from the request body (optional override)
    let useWeighted = config.use_weighted
    try {
        const body = await request.json()
        if (body.method === 'weighted') {
            useWeighted = true
        } else if (body.method === 'random') {
            useWeighted = false
        }
    } catch {
        // No body or invalid JSON — use config default
    }

    // Override the config's use_weighted with the admin's selection
    const drawConfig = { ...config, use_weighted: useWeighted }

    // Run simulation
    const result = await executeDraw(id, drawConfig, true)

    // Mark the draw as 'simulated' so the Publish button appears in the UI
    await adminSupabase!
        .from('draws')
        .update({ status: 'simulated' })
        .eq('id', id)

    return NextResponse.json({ simulation: result })
}
