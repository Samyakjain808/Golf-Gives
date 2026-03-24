import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function AdminWinnersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: winners } = await supabase
        .from('winners')
        .select('*, profiles(full_name, email), draws(draw_month)')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>🏆 Winner Verification</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Review winner proof submissions, approve and mark payments.
                </p>
            </div>

            {!winners || winners.length === 0 ? (
                <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
                    <h3 style={{ color: 'var(--color-cream)', marginBottom: '8px' }}>No winners yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Winners will appear here after draws are published.</p>
                </div>
            ) : (
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Draw</th>
                                    <th>Winner</th>
                                    <th>Tier</th>
                                    <th>Prize</th>
                                    <th>Verification</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(winners as any[]).map((w) => (
                                    <tr key={w.id}>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {w.draws ? format(new Date(w.draws.draw_month), 'MMM yyyy') : '—'}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-cream)' }}>
                                                {w.profiles?.full_name || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{w.profiles?.email}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${w.match_tier === 5 ? 'badge-gold' : w.match_tier === 4 ? 'badge-blue' : 'badge-gray'}`}>
                                                Match {w.match_tier}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                                            €{(w.prize_cents / 100).toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={`badge ${w.verification_status === 'approved' ? 'badge-green' : w.verification_status === 'rejected' ? 'badge-red' : 'badge-gray'}`}>
                                                {w.verification_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${w.payment_status === 'paid' ? 'badge-green' : 'badge-gray'}`}>
                                                {w.payment_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {w.proof_url && (
                                                    <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
                                                        View proof
                                                    </a>
                                                )}
                                                {w.verification_status === 'pending' && (
                                                    <WinnerActions winnerId={w.id} />
                                                )}
                                            </div>
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

function WinnerActions({ winnerId }: { winnerId: string }) {
    return (
        <form
            style={{ display: 'flex', gap: '6px' }}
            onSubmit={async (e) => {
                e.preventDefault()
                const action = (e.nativeEvent as any).submitter?.value
                await fetch(`/api/admin/winners/${winnerId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ verification_status: action }),
                })
                window.location.reload()
            }}
        >
            <button type="submit" value="approved" className="btn btn-primary btn-sm" style={{ fontSize: '12px' }}>Approve</button>
            <button type="submit" value="rejected" className="btn btn-secondary btn-sm" style={{ fontSize: '12px', color: 'var(--color-coral)' }}>Reject</button>
        </form>
    )
}
