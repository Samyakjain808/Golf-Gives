import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Trophy, Heart, LogOut, BarChart3 } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const NAV = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/draws', label: 'Draws', icon: Trophy },
        { href: '/admin/charities', label: 'Charities', icon: Heart },
        { href: '/admin/winners', label: 'Winners', icon: Trophy },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside className="sidebar">
                <div style={{ padding: '0 24px 24px' }}>
                    <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--color-cream)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                        Golf<span style={{ color: 'var(--color-gold)' }}>Gives</span>
                    </a>
                    <div className="badge badge-gold" style={{ fontSize: '11px' }}>⭐ Admin</div>
                </div>

                <nav style={{ flex: 1 }}>
                    {NAV.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} className="sidebar-item">
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                    <div className="divider" style={{ margin: '8px 24px' }} />
                    <Link href="/dashboard" className="sidebar-item">
                        ← Subscriber view
                    </Link>
                </nav>

                <div style={{ padding: '0 24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                        {profile?.full_name || user.email}
                    </div>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-coral-light)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                            <LogOut size={15} /> Sign out
                        </button>
                    </form>
                </div>
            </aside>

            <main style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'var(--bg-base)' }}>
                {children}
            </main>
        </div>
    )
}
