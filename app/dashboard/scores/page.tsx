'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Loader2, Calendar, Target } from 'lucide-react'
import { format } from 'date-fns'

interface Score {
    id: string
    score: number
    played_at: string
    created_at: string
}

export default function ScoresPage() {
    const supabase = createClient()
    const [scores, setScores] = useState<Score[]>([])
    const [scoreValue, setScoreValue] = useState('')
    const [playedAt, setPlayedAt] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function fetchScores() {
        setFetchLoading(true)
        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)
        if (!error && data) setScores(data)
        setFetchLoading(false)
    }

    useEffect(() => { fetchScores() }, [])

    async function addScore(e: React.FormEvent) {
        e.preventDefault()
        const val = Number(scoreValue)
        if (!val || val < 1 || val > 45) {
            setError('Score must be between 1 and 45.')
            return
        }
        setLoading(true)
        setError('')
        setSuccess('')

        const res = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: val, played_at: playedAt }),
        })
        const json = await res.json()

        if (!res.ok) {
            setError(json.error || 'Failed to add score.')
        } else {
            setSuccess('Score added! Your draw entry is updated.')
            setScoreValue('')
            fetchScores()
        }
        setLoading(false)
    }

    async function deleteScore(id: string) {
        const { error } = await supabase.from('scores').delete().eq('id', id)
        if (!error) fetchScores()
    }

    const scoreNums = scores.map(s => s.score)

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>⛳ My Scores</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Your 5 most recent Stableford scores (1–45) are your entry numbers for the monthly draw. The oldest is replaced when you add a new one.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
                {/* Add score form */}
                <div className="glass" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', color: 'var(--color-cream)' }}>Add a score</h2>
                    {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}
                    <form onSubmit={addScore} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <Target size={14} /> Stableford score (1–45)
                            </label>
                            <input
                                id="score-input"
                                type="number"
                                min={1}
                                max={45}
                                required
                                value={scoreValue}
                                onChange={e => setScoreValue(e.target.value)}
                                placeholder="e.g. 34"
                                className="input"
                                style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', height: '64px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <Calendar size={14} /> Date played
                            </label>
                            <input
                                id="played-at"
                                type="date"
                                required
                                value={playedAt}
                                onChange={e => setPlayedAt(e.target.value)}
                                max={format(new Date(), 'yyyy-MM-dd')}
                                className="input"
                            />
                        </div>
                        <button
                            id="add-score-btn"
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? <Loader2 size={16} /> : <Plus size={16} />}
                            {loading ? 'Saving…' : 'Add score'}
                        </button>
                    </form>
                </div>

                {/* Score balls + list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Visual score display */}
                    <div className="glass tier-5" style={{ padding: '28px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px' }}>
                            Your draw entry numbers
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`score-ball ${scoreNums[i] ? '' : 'empty'}`} style={{ width: 56, height: 56, fontSize: '1.3rem' }}>
                                    {scoreNums[i] ?? '?'}
                                </div>
                            ))}
                        </div>
                        {scores.length < 5 && (
                            <div className="alert alert-info" style={{ marginTop: '20px' }}>
                                Add {5 - scores.length} more score{5 - scores.length !== 1 ? 's' : ''} to be eligible for the draw.
                            </div>
                        )}
                        {scores.length >= 5 && (
                            <div className="alert alert-success" style={{ marginTop: '20px' }}>
                                ✅ You are eligible for this month&apos;s draw!
                            </div>
                        )}
                    </div>

                    {/* Score history */}
                    <div className="glass" style={{ padding: '28px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-cream)' }}>Score history</h3>
                        {fetchLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '44px', borderRadius: '8px' }} />)}
                            </div>
                        ) : scores.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No scores entered yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {scores.map((s, i) => (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="score-ball" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{s.score}</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-cream)' }}>Score {s.score}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{format(new Date(s.played_at), 'dd MMM yyyy')}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {i === 0 && <span className="badge badge-green" style={{ fontSize: '11px' }}>Latest</span>}
                                            <button
                                                onClick={() => deleteScore(s.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                title="Delete score"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
