'use client'
import { useState, useEffect } from 'react'
import { Zap, Play, CheckCircle, Loader2, Plus } from 'lucide-react'
import { format } from 'date-fns'

interface Draw {
    id: string
    draw_month: string
    status: 'pending' | 'simulated' | 'published'
    drawn_numbers: number[]
    prize_pool_cents: number
    jackpot_cents: number
    published_at: string | null
}

export default function AdminDrawsPage() {
    const [draws, setDraws] = useState<Draw[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [newMonth, setNewMonth] = useState('')
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
        const res = await fetch(`/api/admin/draws/${drawId}/simulate`, { method: 'POST' })
        const json = await res.json()
        if (!res.ok) setError(json.error)
        else { setSuccess('Simulation complete! Review results before publishing.'); fetchDraws() }
        setActionLoading(null)
    }

    async function publish(drawId: string) {
        if (!confirm('Publish this draw? This will notify winners and cannot be undone.')) return
        setActionLoading(drawId); setError(''); setSuccess('')
        const res = await fetch(`/api/admin/draws/${drawId}/publish`, { method: 'POST' })
        const json = await res.json()
        if (!res.ok) setError(json.error)
        else { setSuccess('Draw published and winners notified!'); fetchDraws() }
        setActionLoading(null)
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>🎯 Draw Management</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Create, simulate, and publish monthly draws. Always simulate before publishing.
                </p>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

            {/* Create new draw */}
            <div className="glass" style={{ padding: '28px', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-cream)' }}>Create a draw</h2>
                <form onSubmit={createDraw} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Draw month
                        </label>
                        <input
                            id="draw-month-input"
                            type="month"
                            value={newMonth}
                            onChange={e => setNewMonth(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                    <button
                        id="create-draw-btn"
                        type="submit"
                        className="btn btn-primary"
                        disabled={actionLoading === 'create'}
                    >
                        {actionLoading === 'create' ? <Loader2 size={16} /> : <Plus size={16} />}
                        Create draw
                    </button>
                </form>
            </div>

            {/* Draws list */}
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
                                        <span className={`badge ${draw.status === 'published' ? 'badge-green' : draw.status === 'simulated' ? 'badge-blue' : 'badge-gray'}`}>
                                            {draw.status}
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
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '10px' }}>
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
                                            <button
                                                id={`publish-${draw.id}`}
                                                onClick={() => publish(draw.id)}
                                                className="btn btn-primary btn-sm"
                                                disabled={actionLoading === draw.id}
                                            >
                                                {actionLoading === draw.id ? <Loader2 size={14} /> : <CheckCircle size={14} />}
                                                Publish
                                            </button>
                                        </>
                                    )}
                                    {draw.status === 'published' && (
                                        <div className="badge badge-green">✅ Published</div>
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
