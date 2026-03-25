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

    try {
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

                // Stripe API 2024+ moved period dates — check both root and items level
                const periodStart = stripeSub.current_period_start
                    ?? stripeSub.items?.data?.[0]?.current_period_start
                const periodEnd = stripeSub.current_period_end
                    ?? stripeSub.items?.data?.[0]?.current_period_end

                await adminSupabase!.from('subscriptions').upsert({
                    user_id: userId,
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    plan,
                    status: 'active',
                    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
                    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
                    cancel_at_period_end: stripeSub.cancel_at_period_end ?? false,
                }, { onConflict: 'user_id' })

                // Send welcome email
                const { data: profile } = await adminSupabase!
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
                        nextBillingDate: periodEnd ? new Date(periodEnd * 1000).toLocaleDateString('en-IE') : 'N/A',
                    }).catch(console.error)
                }
                break
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object as any
                const userId = sub.metadata?.supabase_user_id
                const plan = sub.metadata?.plan ?? 'monthly'
                const status = mapStripeStatus(sub.status)
                const subPeriodStart = sub.current_period_start ?? sub.items?.data?.[0]?.current_period_start
                const subPeriodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end

                await adminSupabase!
                    .from('subscriptions')
                    .update({
                        status,
                        current_period_start: subPeriodStart ? new Date(subPeriodStart * 1000).toISOString() : null,
                        current_period_end: subPeriodEnd ? new Date(subPeriodEnd * 1000).toISOString() : null,
                        cancel_at_period_end: sub.cancel_at_period_end ?? false,
                    })
                    .eq('stripe_subscription_id', sub.id)

                if (userId) {
                    const { data: profile } = await adminSupabase!
                        .from('profiles')
                        .select('email, full_name')
                        .eq('id', userId)
                        .single()

                    if (profile) {
                        await sendSubscriptionEmail({
                            to: profile.email,
                            name: profile.full_name ?? 'Member',
                            plan,
                            status,
                            nextBillingDate: subPeriodEnd ? new Date(subPeriodEnd * 1000).toLocaleDateString('en-IE') : 'N/A',
                        }).catch(console.error)
                    }
                }
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription
                await adminSupabase!
                    .from('subscriptions')
                    .update({ status: 'cancelled' })
                    .eq('stripe_subscription_id', sub.id)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any
                const invoiceSub = invoice.subscription as string | null
                if (invoiceSub) {
                    await adminSupabase!
                        .from('subscriptions')
                        .update({ status: 'lapsed' })
                        .eq('stripe_subscription_id', invoiceSub)
                }
                break
            }
        }

        return NextResponse.json({ received: true })

    } catch (err: any) {
        console.error('[Webhook Error]', err?.message, err?.stack)
        return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
    }
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
