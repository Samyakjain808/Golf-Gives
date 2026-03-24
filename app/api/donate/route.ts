import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { charity_id, amount_cents, donor_name, donor_email, user_id } = await req.json()

    if (!charity_id) return NextResponse.json({ error: 'charity_id required' }, { status: 400 })
    if (!amount_cents || amount_cents < 100) return NextResponse.json({ error: 'Minimum donation is €1' }, { status: 400 })
    if (!donor_name || !donor_email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 })

    // Verify charity exists
    const { data: charity, error: charityErr } = await supabase
        .from('charities')
        .select('id, name')
        .eq('id', charity_id)
        .eq('is_active', true)
        .single()

    if (charityErr || !charity) return NextResponse.json({ error: 'Charity not found' }, { status: 404 })

    // Insert contribution record
    const { error } = await supabase
        .from('charity_contributions')
        .insert({
            charity_id,
            user_id: user_id ?? null,
            amount_cents,
            type: 'direct_donation',
            donor_name,
            donor_email,
        })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, charity: charity.name, amount_cents }, { status: 201 })
}
