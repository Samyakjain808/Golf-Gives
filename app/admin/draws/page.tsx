'use client'
import { useState, useEffect } from 'react'
import { Zap, Play, CheckCircle, Loader2, Plus, AlertCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'

interface Draw {
    id: string
    draw_month: string
    status: 'pending' | 'simulated' | 'published' | 'visible'
    drawn_numbers: number[]
    prize_pool_cents: number
    jackpot_cents: number
    published_at: string | null
    visible_at: string | null
}

export default function AdminDrawsPage() {
    const [draws, setDraws] = useState<Draw[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [confirmPublishId, setConfirmPublishId] = useState<string | null>(null)
    const [confirmVisibleId, setConfirmVisibleId] = useState<string | null>(null)
    const [newMonth, setNewMonth] = useState('')
    const [drawMethod, setDrawMethod] = useState<'random' | 'weighted'>('random')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function fetchDraws() {
        const res = await fetch('/api/admin/draws')
        const json = await res.json()
        if (!res.ok) setError(json.error)
        else setDraws(json.draws ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchDraws() }, [])

    async function createDraw(e: React.FormEvent) {
        e.preventDefault()
        if (!newMonth) return
        setActionLoading('create'); setError(''); setSuccess('')
        const res = await fetch('/api/admin/draws', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draw_month: `${newMonth}-01` }),
        })
        const json = await res.json()
        if (!res.ok) setError(json.error)
        else { setSuccess('Draw created!'); setNewMonth(''); fetchDraws() }
        setActionLoading(null)
    }

    async function simulate(drawId: string) {
        setActionLoading(drawId); setError(''); setSuccess('')
        const res = await fetch(`/api/admin/draws/${drawId}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: drawMethod }),
        })
        const json = await res.json()
        if (!res.ok) setError(json.error)
        else { setSuccess(`Simulation complete (${drawMethod === 'weighted' ? 'Algorithmic' : 'Random'} mode)! Review results before publishing.`); fetchDraws() }
        setActionLoading(null)
    }

    async function publish(drawId: string) {
        setConfirmPublishId(null)
        setActionLoading(drawId); setError(''); setSuccess('')
        try {
            const res = await fetch(`/api/admin/draws/${drawId}/publish`, { method: 'POST' })
            let json
            try {
                json = await res.json()
            } catch (e) {
                throw new Error(`Server returned invalid response: ${res.status}`)
            }
            if (!res.ok) setError(json.error || 'Failed to publish draw')
            else { setSuccess('Draw published internally! Results are locked. Use "Make Visible" to release to users.'); fetchDraws() }
        } catch (err: any) {
            setError(err.message || 'Network error occurred')
        } finally {
            setActionLoading(null)
        }
    }

    async function makeVisible(drawId: string) {
        setConfirmVisibleId(null)
        setActionLoading(drawId); setError(''); setSuccess('')
        try {
            const res = await fetch(`/api/admin/draws/${drawId}/make-visible`, { method: 'POST' })
            let json
            try {
                json = await res.json()
            } catch (e) {
                throw new Error(`Server returned invalid response: ${res.status}`)
            }
            if (!res.ok) setError(json.error || 'Failed to make draw visible')
            else { setSuccess('Draw is now visible to all users! Notification emails sent.'); fetchDraws() }
        } catch (err: any) {
            setError(err.message || 'Network error occurred')
        } finally {
            setActionLoading(null)
        }
    }

    function getStatusBadgeClass(status: string) {
        switch (status) {
            case 'visible': return 'badge-green'
            case 'published': return 'badge-gold'
            case 'simulated': return 'badge-blue'
            default: return 'badge-gray'
        }
    }

    function getStatusLabel(status: string) {
        switch (status) {
            case 'visible': return '✅ Visible to Users'
            case 'published': return '🔒 Published (Internal)'
            case 'simulated': return '🔬 Simulated'
            default: return '⏳ Pending'
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>🎯 Draw Management</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Create, simulate, publish, and control visibility of monthly draws.
                </p>
            </div>

            {/* Status flow explainer */}
            <div className="glass" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid var(--color-gold)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-cream)', marginBottom: '8px' }}>Draw Lifecycle</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span className="badge badge-gray">⏳ Pending</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="badge badge-blue">🔬 Simulated</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="badge badge-gold">🔒 Published</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className="badge badge-green">✅ Visible</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Users only see draws with <strong style={{ color: 'var(--color-cream)' }}>Visible</strong> status. Published draws are locked internally but hidden from users.
                </div>
            </div>

            {error && (
                <div className="glass" style={{ borderLeft: '4px solid var(--color-red)', padding: '16px', marginBottom: '24px', color: 'var(--color-red)' }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="glass" style={{ borderLeft: '4px solid var(--color-green)', padding: '16px', marginBottom: '24px', color: 'var(--color-green)' }}>
                    {success}
                </div>
            )}

            {/* Config & Creation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {/* Method Selection */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>Generation Method</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Choose how draw numbers are generated when you simulate.</p>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        <button
                            onClick={() => setDrawMethod('random')}
                            style={{
                                textAlign: 'left',
                                padding: '16px',
                                background: drawMethod === 'random' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                border: drawMethod === 'random' ? '1px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: 'var(--color-cream)', marginBottom: '4px' }}>🎲 Random</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pure random — each number 1–45 has equal probability.</div>
                        </button>

                        <button
                            onClick={() => setDrawMethod('weighted')}
                            style={{
                                textAlign: 'left',
                                padding: '16px',
                                background: drawMethod === 'weighted' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                border: drawMethod === 'weighted' ? '1px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: 'var(--color-cream)', marginBottom: '4px' }}>🧠 Algorithmic (Weighted)</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Numbers that appear more frequently in player scores have a higher probability of being drawn.</div>
                        </button>
                    </div>
                </div>

                <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-cream)', marginBottom: '24px' }}>Create New Draw</h3>
                    <form onSubmit={createDraw} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Draw Month
                            </label>
                            <input
                                type="month"
                                className="input"
                                style={{ width: '100%', marginBottom: '20px' }}
                                value={newMonth}
                                onChange={e => setNewMonth(e.target.value)}
                                min={format(new Date(), 'yyyy-MM')}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={actionLoading === 'create' || !newMonth} style={{ width: '100%', justifyContent: 'center' }}>
                            {actionLoading === 'create' ? <Loader2 size={16} /> : <Plus size={16} />}
                            Create Draw
                        </button>
                    </form>
                </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-cream)', marginBottom: '24px' }}>Draw History</h2>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />)}
                </div>
            ) : draws.length === 0 ? (
                <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No draws created yet. Create the first one above.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {draws.map((draw) => (
                        <div key={draw.id} className="glass" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-cream)', margin: 0 }}>
                                            {format(new Date(draw.draw_month), 'MMMM yyyy')}
                                        </h3>
                                        <span className={`badge ${getStatusBadgeClass(draw.status)}`}>
                                            {getStatusLabel(draw.status)}
                                        </span>
                                    </div>

                                    {draw.drawn_numbers && draw.drawn_numbers.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            {draw.drawn_numbers.map((n, i) => (
                                                <div key={i} className="score-ball" style={{ width: 40, height: 40, fontSize: '1rem' }}>{n}</div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <span>Pool: <strong style={{ color: 'var(--color-gold)' }}>€{(draw.prize_pool_cents / 100).toFixed(0)}</strong></span>
                                        {draw.jackpot_cents > 0 && (
                                            <span>Jackpot: <strong style={{ color: 'var(--color-gold)' }}>€{(draw.jackpot_cents / 100).toFixed(0)}</strong></span>
                                        )}
                                        {draw.published_at && (
                                            <span>Published: {format(new Date(draw.published_at), 'dd MMM yyyy')}</span>
                                        )}
                                        {draw.visible_at && (
                                            <span>Visible: {format(new Date(draw.visible_at), 'dd MMM yyyy')}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {draw.status === 'pending' && (
                                        <button
                                            id={`simulate-${draw.id}`}
                                            onClick={() => simulate(draw.id)}
                                            className="btn btn-secondary btn-sm"
                                            disabled={actionLoading === draw.id}
                                        >
                                            {actionLoading === draw.id ? <Loader2 size={14} /> : <Play size={14} />}
                                            Simulate
                                        </button>
                                    )}
                                    {draw.status === 'simulated' && (
                                        <>
                                            <button
                                                onClick={() => simulate(draw.id)}
                                                className="btn btn-secondary btn-sm"
                                                disabled={actionLoading === draw.id}
                                            >
                                                <Play size={14} /> Re-simulate
                                            </button>
                                            
                                            {confirmPublishId === draw.id ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-red)', padding: '4px', borderRadius: '4px' }}>
                                                    <AlertCircle size={14} style={{ color: 'var(--color-red)', marginLeft: '4px' }} />
                                                    <span style={{ fontSize: '12px', color: 'var(--color-cream)', marginRight: '4px' }}>Lock results?</span>
                                                    <button onClick={() => publish(draw.id)} className="btn btn-primary btn-sm" style={{ padding: '0 8px' }}>Yes</button>
                                                    <button onClick={() => setConfirmPublishId(null)} className="btn btn-secondary btn-sm" style={{ padding: '0 8px' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    id={`publish-${draw.id}`}
                                                    onClick={() => setConfirmPublishId(draw.id)}
                                                    className="btn btn-primary btn-sm"
                                                    disabled={actionLoading === draw.id}
                                                >
                                                    {actionLoading === draw.id ? <Loader2 size={14} /> : <CheckCircle size={14} />}
                                                    Publish (Lock)
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {draw.status === 'published' && (
                                        <>
                                            {confirmVisibleId === draw.id ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(212, 175, 55, 0.1)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                                    <Eye size={14} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '12px', color: 'var(--color-cream)', whiteSpace: 'nowrap' }}>Release to users?</span>
                                                    <button onClick={() => makeVisible(draw.id)} className="btn btn-primary btn-sm" style={{ padding: '2px 10px', fontSize: '12px' }}>
                                                        Yes, Make Visible
                                                    </button>
                                                    <button onClick={() => setConfirmVisibleId(null)} className="btn btn-secondary btn-sm" style={{ padding: '2px 10px', fontSize: '12px' }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    id={`make-visible-${draw.id}`}
                                                    onClick={() => setConfirmVisibleId(draw.id)}
                                                    className="btn btn-primary btn-sm"
                                                    disabled={actionLoading === draw.id}
                                                    style={{ background: 'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold))', color: '#1a1a1a' }}
                                                >
                                                    {actionLoading === draw.id ? <Loader2 size={14} /> : <Eye size={14} />}
                                                    Make Visible to Users
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {draw.status === 'visible' && (
                                        <div className="badge badge-green">✅ Visible to Users</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
