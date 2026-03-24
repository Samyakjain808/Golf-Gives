import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Heart, BarChart3, Plus, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Parallel data fetch
    const [
        { data: profile },
        { data: scores },
        { data: subscription },
        { data: charitySelection },
        { data: recentDraw },
        { data: winnings },
    ] = await Promise.all([
        supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
        supabase.from('scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
        supabase.from('user_charity_selections').select('*, charities(name, category)').eq('user_id', user.id).eq('is_active', true).single(),
        supabase.from('draws').select('*').eq('status', 'published').order('draw_month', { ascending: false }).limit(1).single(),
        supabase.from('winners').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    ])

    const scoreCount = scores?.length ?? 0
    const isEligible = scoreCount >= 5 && !!subscription

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '6px' }}>
                    Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Golfer'} 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    {isEligible
                        ? "You're entered in this month's draw — good luck! 🍀"
                        : scoreCount < 5
                            ? `Enter ${5 - scoreCount} more score${5 - scoreCount !== 1 ? 's' : ''} to be eligible for this month's draw.`
                            : 'Subscribe to enter the monthly prize draw.'}
                </p>
            </div>

            {/* Top metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {/* Subscription status */}
                <div className="glass" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Subscription
                    </div>
                    {subscription ? (
                        <>
                            <div className="badge badge-green" style={{ marginBottom: '8px' }}>Active</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                {subscription.plan === 'yearly' ? 'Yearly plan' : 'Monthly plan'}
                            </div>
                            {subscription.current_period_end && (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Renews {format(new Date(subscription.current_period_end), 'dd MMM yyyy')}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="badge badge-gray">Inactive</div>
                            <Link href="/pricing" className="btn btn-primary btn-sm" style={{ marginTop: '12px', display: 'inline-flex' }}>
                                Subscribe now
                            </Link>
                        </>
                    )}
                </div>

                {/* Scores */}
                <div className="glass" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Draw Numbers
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`score-ball ${scores && scores[i] ? '' : 'empty'}`} style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                                {scores && scores[i] ? scores[i].score : '?'}
                            </div>
                        ))}
                    </div>
                    <Link href="/dashboard/scores" style={{ fontSize: '13px', color: 'var(--color-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                        <Plus size={14} /> Add score
                    </Link>
                </div>

                {/* Charity */}
                <div className="glass" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Supporting
                    </div>
                    {charitySelection ? (
                        <>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-cream)', marginBottom: '4px' }}>
                                {(charitySelection.charities as any)?.name}
                            </div>
                            <div className="badge badge-red" style={{ fontSize: '11px' }}>
                                {charitySelection.contribution_pct}% of subscription
                            </div>
                            <Link href="/dashboard/charity" style={{ fontSize: '13px', color: 'var(--color-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                                Change charity <ChevronRight size={14} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>No charity selected yet.</div>
                            <Link href="/dashboard/charity" className="btn btn-coral btn-sm">Choose charity</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Latest draw */}
            {recentDraw && (
                <div className="glass tier-5" style={{ padding: '28px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div className="badge badge-gold" style={{ marginBottom: '12px' }}>
                                🎯 Latest draw — {format(new Date(recentDraw.draw_month), 'MMMM yyyy')}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                {recentDraw.drawn_numbers?.map((n: number, i: number) => (
                                    <div key={i} className="score-ball" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.3), rgba(212,168,83,0.1))' }}>
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Prize pool</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                                €{((recentDraw.prize_pool_cents + recentDraw.jackpot_cents) / 100).toFixed(0)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Winnings */}
            {winnings && winnings.length > 0 && (
                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--color-cream)' }}>🏆 Your winnings</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Draw</th>
                                    <th>Tier</th>
                                    <th>Prize</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {winnings.map((w: any) => (
                                    <tr key={w.id}>
                                        <td>{w.draw_id.slice(0, 8)}…</td>
                                        <td><span className="badge badge-gold">Match {w.match_tier}</span></td>
                                        <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>€{(w.prize_cents / 100).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${w.payment_status === 'paid' ? 'badge-green' : 'badge-gray'}`}>
                                                {w.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
