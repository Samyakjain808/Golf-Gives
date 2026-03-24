import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// POST /api/stripe/checkout - create Stripe checkout session
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { plan } = body // 'monthly' | 'yearly'

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = plan === 'monthly'
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID

    if (!priceId) {
        return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', user.id)
            .single()

        const customer = await stripe.customers.create({
            email: profile?.email ?? user.email ?? '',
            name: profile?.full_name ?? undefined,
            metadata: { supabase_user_id: user.id },
        })
        customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
        metadata: { supabase_user_id: user.id, plan },
        subscription_data: { metadata: { supabase_user_id: user.id, plan } },
    })

    return NextResponse.json({ url: session.url })
}
