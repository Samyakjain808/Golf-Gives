import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminAnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const [
        { count: totalUsers },
        { count: activeSubscribers },
        { data: draws },
        { data: contributions },
        { data: winners },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('draws').select('draw_month, prize_pool_cents, jackpot_cents, status').order('draw_month', { ascending: true }),
        supabase.from('charity_contributions').select('amount_cents, charity_id, charities(name)'),
        supabase.from('winners').select('prize_cents, payment_status, verification_status'),
    ])

    const totalRevenueCents = (activeSubscribers ?? 0) * 1500
    const totalPrizePoolCents = (draws ?? []).reduce((s: number, d: any) => s + d.prize_pool_cents, 0)
    const totalCharityRaisedCents = (contributions ?? []).reduce((s: number, c: any) => s + c.amount_cents, 0)
    const totalPaidOutCents = (winners ?? []).filter((w: any) => w.payment_status === 'paid').reduce((s: number, w: any) => s + w.prize_cents, 0)
    const pendingVerifications = (winners ?? []).filter((w: any) => w.verification_status === 'pending').length

    // Charity breakdown
    const charityMap: Record<string, { name: string; total: number }> = {}
        ; (contributions ?? []).forEach((c: any) => {
            const id = c.charity_id
            if (!charityMap[id]) charityMap[id] = { name: c.charities?.name ?? 'Unknown', total: 0 }
            charityMap[id].total += c.amount_cents
        })
    const charityBreakdown = Object.values(charityMap).sort((a, b) => b.total - a.total).slice(0, 6)
    const maxCharity = charityBreakdown[0]?.total ?? 1

    // Draw history for bar chart
    const drawHistory = (draws ?? []).slice(-6)
    const maxPool = Math.max(...drawHistory.map((d: any) => d.prize_pool_cents + d.jackpot_cents), 1)

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>📊 Reports & Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Platform-wide statistics and financial overview.</p>
            </div>

            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Users', value: totalUsers ?? 0, icon: '👥', color: 'var(--color-gold)' },
                    { label: 'Active Subscribers', value: activeSubscribers ?? 0, icon: '✅', color: '#4ade80' },
                    { label: 'Monthly Revenue', value: `€${(totalRevenueCents / 100).toFixed(0)}`, icon: '💳', color: 'var(--color-gold)' },
                    { label: 'Pending Verifications', value: pendingVerifications, icon: '⏳', color: 'var(--color-coral)' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="glass" style={{ padding: '22px' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Financial summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.1rem', color: 'var(--color-cream)', marginBottom: '24px' }}>💰 Financial Summary</h2>
                    {[
                        { label: 'Total subscription revenue', value: `€${(totalRevenueCents / 100).toFixed(0)}`, color: 'var(--color-gold)' },
                        { label: 'Total prize pools run', value: `€${(totalPrizePoolCents / 100).toFixed(0)}`, color: 'var(--color-gold)' },
                        { label: 'Total charity raised', value: `€${(totalCharityRaisedCents / 100).toFixed(0)}`, color: 'var(--color-coral)' },
                        { label: 'Total prizes paid out', value: `€${(totalPaidOutCents / 100).toFixed(0)}`, color: '#4ade80' },
                    ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{row.label}</span>
                            <span style={{ fontWeight: 700, color: row.color, fontSize: '16px' }}>{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* Draw history bar chart */}
                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.1rem', color: 'var(--color-cream)', marginBottom: '24px' }}>🎯 Prize Pool History</h2>
                    {drawHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No draws yet</div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
                            {drawHistory.map((d: any, i: number) => {
                                const total = d.prize_pool_cents + d.jackpot_cents
                                const heightPct = Math.max((total / maxPool) * 100, 4)
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--color-gold)', fontWeight: 700 }}>€{(total / 100).toFixed(0)}</div>
                                        <div style={{
                                            width: '100%', height: `${heightPct}%`, minHeight: '6px',
                                            background: d.status === 'published'
                                                ? 'linear-gradient(to top, var(--color-gold-dark), var(--color-gold))'
                                                : 'linear-gradient(to top, rgba(212,168,83,0.3), rgba(212,168,83,0.15))',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.4s ease',
                                        }} />
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                            {new Date(d.draw_month).toLocaleDateString('en-IE', { month: 'short' })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '2px', background: 'var(--color-gold)' }} /> Published
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '2px', background: 'rgba(212,168,83,0.3)' }} /> Pending/Simulated
                        </div>
                    </div>
                </div>
            </div>

            {/* Charity breakdown */}
            <div className="glass" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--color-cream)', marginBottom: '24px' }}>❤️ Charity Contribution Breakdown</h2>
                {charityBreakdown.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No contributions recorded yet.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {charityBreakdown.map((c, i) => {
                            const widthPct = (c.total / maxCharity) * 100
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{c.name}</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-coral)' }}>€{(c.total / 100).toFixed(0)}</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${widthPct}%`, background: 'linear-gradient(to right, var(--color-coral-dark), var(--color-coral))', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
