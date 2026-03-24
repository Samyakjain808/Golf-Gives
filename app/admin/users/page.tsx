import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: users } = await supabase
        .from('profiles')
        .select('*, subscriptions(status, plan, current_period_end)')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>👥 Users</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    All registered users and their subscription status.
                </p>
            </div>

            <div className="glass" style={{ overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Country</th>
                                <th>Subscription</th>
                                <th>Plan</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(users as any[] ?? []).map((u) => {
                                const sub = u.subscriptions?.[0]
                                return (
                                    <tr key={u.id}>
                                        <td style={{ color: 'var(--color-cream)', fontWeight: 500 }}>{u.full_name || '—'}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>{u.role}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{u.country || '—'}</td>
                                        <td>
                                            <span className={`badge ${sub?.status === 'active' ? 'badge-green' : sub?.status ? 'badge-red' : 'badge-gray'}`}>
                                                {sub?.status || 'none'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{sub?.plan || '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {new Date(u.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
