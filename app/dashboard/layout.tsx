import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Trophy, Heart, BarChart3, LogOut, User } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    const NAV = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/scores', label: 'My Scores', icon: BarChart3 },
        { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
        { href: '/dashboard/draws', label: 'Draw History', icon: Trophy },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div style={{ padding: '0 24px 24px' }}>
                    <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-cream)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                        Golf<span style={{ color: 'var(--color-gold)' }}>Gives</span>
                    </a>
                    <div className="badge badge-green" style={{ fontSize: '11px' }}>
                        {profile?.role === 'admin' ? '⭐ Admin' : '✅ Subscriber'}
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    {NAV.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} className="sidebar-item">
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                    {profile?.role === 'admin' && (
                        <>
                            <div className="divider" style={{ margin: '8px 24px' }} />
                            {[
                                { href: '/admin', label: 'Admin Overview' },
                                { href: '/admin/draws', label: 'Manage Draws' },
                                { href: '/admin/users', label: 'Users' },
                                { href: '/admin/winners', label: 'Winners' },
                            ].map(({ href, label }) => (
                                <Link key={href} href={href} className="sidebar-item" style={{ fontSize: '13px' }}>
                                    {label}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                <div style={{ padding: '0 24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                        {profile?.full_name || user.email}
                    </div>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-coral-light)', borderLeft: 'none', padding: '8px 0' }}>
                            <LogOut size={16} /> Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'var(--bg-base)' }}>
                {children}
            </main>
        </div>
    )
}
