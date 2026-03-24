import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Trophy, Heart, BarChart3, Zap, CheckCircle } from 'lucide-react'

async function getAdminStats(supabase: any) {
    const [
        { count: userCount },
        { count: activeSubCount },
        { data: draws },
        { data: pendingWinners },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('draws').select('id, prize_pool_cents, jackpot_cents, status, draw_month').order('draw_month', { ascending: false }).limit(6),
        supabase.from('winners').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    ])
    return { userCount, activeSubCount, draws, pendingWinners }
}

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { userCount, activeSubCount, draws, pendingWinners } = await getAdminStats(supabase)

    const totalRevenueCents = (activeSubCount ?? 0) * 1500
    const prizePoolCents = Math.floor(totalRevenueCents * 0.5)

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <div className="badge badge-gold" style={{ marginBottom: '12px' }}>⭐ Admin Dashboard</div>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>Overview</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Platform health and quick actions.
                </p>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Users', value: userCount ?? 0, icon: Users, color: 'var(--color-gold)' },
                    { label: 'Active Subscribers', value: activeSubCount ?? 0, icon: CheckCircle, color: '#4ade80' },
                    { label: 'Monthly Revenue', value: `€${(totalRevenueCents / 100).toFixed(0)}`, icon: BarChart3, color: 'var(--color-gold)' },
                    { label: 'Pending Verifications', value: pendingWinners ?? 0, icon: Trophy, color: 'var(--color-coral)' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                            <Icon size={18} style={{ color }} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-cream)' }}>🎯 Draw Management</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                        Current prize pool this month: <strong style={{ color: 'var(--color-gold)' }}>€{(prizePoolCents / 100).toFixed(0)}</strong> from {activeSubCount} subscribers.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Link href="/admin/draws" className="btn btn-primary btn-sm">
                            <Zap size={14} /> Manage draws
                        </Link>
                        <Link href="/admin/winners" className="btn btn-secondary btn-sm">
                            Verify winners
                        </Link>
                    </div>
                </div>

                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-cream)' }}>👥 User Management</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                        Browse, search, and manage subscriber accounts and subscription statuses.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href="/admin/users" className="btn btn-primary btn-sm">View all users</Link>
                        <Link href="/admin/charities" className="btn btn-secondary btn-sm">
                            <Heart size={14} /> Charities
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent draws */}
            {draws && draws.length > 0 && (
                <div className="glass" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-cream)', margin: 0 }}>Recent Draws</h2>
                        <Link href="/admin/draws" style={{ fontSize: '13px', color: 'var(--color-gold)', textDecoration: 'none' }}>View all →</Link>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Status</th>
                                    <th>Prize Pool</th>
                                    <th>Jackpot</th>
                                </tr>
                            </thead>
                            <tbody>
                                {draws.map((draw: any) => (
                                    <tr key={draw.id}>
                                        <td style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                                            {new Date(draw.draw_month).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span className={`badge ${draw.status === 'published' ? 'badge-green' : draw.status === 'simulated' ? 'badge-blue' : 'badge-gray'}`}>
                                                {draw.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>€{(draw.prize_pool_cents / 100).toFixed(0)}</td>
                                        <td style={{ color: draw.jackpot_cents > 0 ? 'var(--color-gold)' : 'var(--text-muted)' }}>
                                            €{(draw.jackpot_cents / 100).toFixed(0)}
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
