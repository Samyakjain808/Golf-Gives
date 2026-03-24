import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function DrawsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: draws }, { data: myEntries }] = await Promise.all([
        supabase.from('draws').select('*, prizes(*)').eq('status', 'published').order('draw_month', { ascending: false }),
        supabase.from('draw_entries').select('draw_id, entry_numbers, match_count').eq('user_id', user.id),
    ])

    const entryMap = new Map(myEntries?.map(e => [e.draw_id, e]) ?? [])

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>🎯 Draw History</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    All published monthly draws and your participation record.
                </p>
            </div>

            {!draws || draws.length === 0 ? (
                <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎰</div>
                    <h3 style={{ color: 'var(--color-cream)', marginBottom: '8px' }}>No draws yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>The first draw will appear here once published by the admin.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {draws.map((draw: any) => {
                        const entry = entryMap.get(draw.id)
                        const totalPool = (draw.prize_pool_cents + draw.jackpot_cents) / 100
                        const prizes = draw.prizes ?? []

                        return (
                            <div key={draw.id} className="glass" style={{ padding: '28px' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <div className="badge badge-green" style={{ marginBottom: '8px' }}>Published</div>
                                        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-cream)', margin: 0 }}>
                                            {format(new Date(draw.draw_month), 'MMMM yyyy')} Draw
                                        </h2>
                                        {draw.published_at && (
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                Published {format(new Date(draw.published_at), 'dd MMM yyyy')}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total prize pool</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                                            €{totalPool.toFixed(0)}
                                        </div>
                                        {draw.jackpot_cents > 0 && (
                                            <div className="badge badge-gold" style={{ marginTop: '4px' }}>
                                                incl. €{(draw.jackpot_cents / 100).toFixed(0)} rollover
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Drawn numbers */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                                        Drawn numbers
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {draw.drawn_numbers?.map((n: number, i: number) => {
                                            const isMatch = entry?.entry_numbers?.includes(n)
                                            return (
                                                <div
                                                    key={i}
                                                    className="score-ball"
                                                    style={{
                                                        background: isMatch ? 'linear-gradient(135deg, rgba(212,168,83,0.4), rgba(212,168,83,0.2))' : 'transparent',
                                                        borderColor: isMatch ? 'var(--color-gold)' : 'var(--border-medium)',
                                                        color: isMatch ? 'var(--color-gold)' : 'var(--text-secondary)',
                                                    }}
                                                >
                                                    {n}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* My entry */}
                                {entry ? (
                                    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>YOUR ENTRY NUMBERS</div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {entry.entry_numbers.map((n: number, i: number) => (
                                                    <span key={i} className="badge badge-gray" style={{ fontWeight: 700 }}>{n}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Matches</div>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: entry.match_count >= 3 ? 'var(--color-gold)' : 'var(--text-secondary)' }}>
                                                {entry.match_count}
                                            </div>
                                        </div>
                                        {entry.match_count >= 3 && (
                                            <div className="badge badge-gold">🏆 Winner! Check your dashboard</div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
                                        You were not entered in this draw (required 5 scores + active subscription).
                                    </div>
                                )}

                                {/* Prize tiers */}
                                {prizes.length > 0 && (
                                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        {prizes.map((prize: any) => (
                                            <div key={prize.id} className={`glass tier-${prize.match_tier}`} style={{ padding: '14px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Match {prize.match_tier}</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gold)', margin: '6px 0' }}>€{(prize.total_cents / 100).toFixed(0)}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prize.winner_count} winner{prize.winner_count !== 1 ? 's' : ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
