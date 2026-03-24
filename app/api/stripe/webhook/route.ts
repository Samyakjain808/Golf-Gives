import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { sendSubscriptionEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const userId = session.metadata?.supabase_user_id
            const plan = session.metadata?.plan as 'monthly' | 'yearly'
            const customerId = session.customer as string
            const subscriptionId = session.subscription as string

            if (!userId) break

            // Fetch subscription details from Stripe
            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any

            await adminSupabase.from('subscriptions').upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan,
                status: 'active',
                current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
                cancel_at_period_end: stripeSub.cancel_at_period_end,
            }, { onConflict: 'user_id' })

            // Send welcome email
            const { data: profile } = await adminSupabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', userId)
                .single()

            if (profile) {
                await sendSubscriptionEmail({
                    to: profile.email,
                    name: profile.full_name ?? 'Member',
                    plan,
                    status: 'active',
                    nextBillingDate: new Date(stripeSub.current_period_end * 1000).toLocaleDateString('en-IE'),
                }).catch(console.error)
            }
            break
        }

        case 'customer.subscription.updated': {
            const sub = event.data.object as any
            const userId = sub.metadata?.supabase_user_id

            const status = mapStripeStatus(sub.status)

            await adminSupabase
                .from('subscriptions')
                .update({
                    status,
                    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: sub.cancel_at_period_end,
                })
                .eq('stripe_subscription_id', sub.id)

            if (userId) {
                const { data: profile } = await adminSupabase
                    .from('profiles')
                    .select('email, full_name')
                    .eq('id', userId)
                    .single()

                if (profile) {
                    await sendSubscriptionEmail({
                        to: profile.email,
                        name: profile.full_name ?? 'Member',
                        plan: sub.metadata?.plan ?? 'monthly',
                        status,
                        nextBillingDate: new Date(sub.current_period_end * 1000).toLocaleDateString('en-IE'),
                    }).catch(console.error)
                }
            }
            break
        }

        case 'customer.subscription.deleted': {
            const sub = event.data.object as any
            await adminSupabase
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('stripe_subscription_id', sub.id)
            break
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as any
            const invoiceSub = invoice.subscription as string | null
            if (invoiceSub) {
                await adminSupabase
                    .from('subscriptions')
                    .update({ status: 'lapsed' })
                    .eq('stripe_subscription_id', invoiceSub)
            }
            break
        }
    }

    return NextResponse.json({ received: true })
}

function mapStripeStatus(stripeStatus: string): string {
    const map: Record<string, string> = {
        active: 'active',
        past_due: 'lapsed',
        canceled: 'cancelled',
        unpaid: 'lapsed',
        trialing: 'trialing',
        incomplete: 'pending',
        incomplete_expired: 'inactive',
        paused: 'inactive',
    }
    return map[stripeStatus] ?? 'inactive'
}
