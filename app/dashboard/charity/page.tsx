'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Loader2, Check } from 'lucide-react'

interface Charity {
    id: string
    name: string
    category: string
    description: string
}

interface Selection {
    charity_id: string
    contribution_pct: number
    charities: { name: string; category: string }
}

export default function CharityDashboardPage() {
    const supabase = createClient()
    const [charities, setCharities] = useState<Charity[]>([])
    const [selection, setSelection] = useState<Selection | null>(null)
    const [selected, setSelected] = useState('')
    const [pct, setPct] = useState(10)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            const [{ data: cList }, { data: sel }] = await Promise.all([
                supabase.from('charities').select('id, name, category, description').eq('is_active', true).order('name'),
                supabase.from('user_charity_selections').select('*, charities(name, category)').eq('is_active', true).single(),
            ])
            if (cList) setCharities(cList)
            if (sel) {
                setSelection(sel as unknown as Selection)
                setSelected(sel.charity_id)
                setPct(sel.contribution_pct)
            }
        }
        load()
    }, [])

    async function save(e: React.FormEvent) {
        e.preventDefault()
        if (!selected) { setError('Please choose a charity.'); return }
        setLoading(true); setError(''); setSuccess('')

        const res = await fetch('/api/charity-selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ charity_id: selected, contribution_pct: pct }),
        })
        const json = await res.json()
        if (!res.ok) setError(json.error || 'Failed to save.')
        else {
            setSuccess('Charity updated successfully! Changes take effect next billing cycle.')
            const upd = charities.find(c => c.id === selected)
            if (upd) setSelection({ charity_id: selected, contribution_pct: pct, charities: { name: upd.name, category: upd.category } })
        }
        setLoading(false)
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>❤️ My Charity</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Choose which Irish charity benefits from your subscription. Minimum 10% of your fee goes directly to them.
                </p>
            </div>

            {/* Current selection */}
            {selection && (
                <div className="glass tier-5" style={{ padding: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Currently supporting</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-cream)' }}>{selection.charities?.name}</div>
                        <div className="badge badge-red" style={{ marginTop: '8px' }}>{selection.charities?.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gold)' }}>{selection.contribution_pct}%</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>of your subscription</div>
                    </div>
                </div>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* Charity grid */}
                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-cream)' }}>Choose your charity</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {charities.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelected(c.id)}
                                style={{
                                    padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer',
                                    border: `2px solid ${selected === c.id ? 'var(--color-gold)' : 'var(--border-subtle)'}`,
                                    background: selected === c.id ? 'rgba(212,168,83,0.08)' : 'transparent',
                                    transition: 'all 0.2s', position: 'relative',
                                }}
                            >
                                {selected === c.id && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: 20, height: 20, borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Check size={12} style={{ color: 'var(--color-forest-dark)' }} />
                                    </div>
                                )}
                                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-gold)', marginBottom: '6px', textTransform: 'uppercase' }}>{c.category}</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: selected === c.id ? 'var(--color-gold)' : 'var(--color-cream)' }}>{c.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contribution slider */}
                <div className="glass" style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-cream)' }}>Contribution amount</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                        Choose what percentage of your monthly fee goes to charity. Minimum 10%, maximum 50%.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="range" min={10} max={50} step={5} value={pct}
                                onChange={e => setPct(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-gold)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                <span>10% (min)</span><span>50%</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1 }}>{pct}%</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>= €{((15 * pct) / 100).toFixed(2)}/mo</div>
                        </div>
                    </div>
                </div>

                <button id="save-charity-btn" type="submit" className="btn btn-coral" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                    {loading ? <Loader2 size={16} /> : <Heart size={16} />}
                    {loading ? 'Saving…' : 'Save charity preference'}
                </button>
            </form>
        </div>
    )
}
