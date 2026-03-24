'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart, Loader2 } from 'lucide-react'
import Navbar from '@/app/components/Navbar'

const AMOUNTS = [5, 10, 25, 50, 100]

function DonateForm() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const preselectedCharity = searchParams.get('charity')

    const [charities, setCharities] = useState<any[]>([])
    const [selectedCharity, setSelectedCharity] = useState(preselectedCharity ?? '')
    const [amount, setAmount] = useState(25)
    const [customAmount, setCustomAmount] = useState('')
    const [useCustom, setUseCustom] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        supabase.from('charities').select('id, name, category').eq('is_active', true).order('name')
            .then(({ data }) => { if (data) setCharities(data) })
    }, [])

    const finalAmount = useCustom ? Math.max(1, Number(customAmount) || 0) : amount

    async function handleDonate(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedCharity) { setError('Please select a charity.'); return }
        if (finalAmount < 1) { setError('Minimum donation is €1.'); return }
        if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return }

        setLoading(true); setError('')

        // Check if user is logged in; get their ID if so
        const { data: { user } } = await supabase.auth.getUser()

        const res = await fetch('/api/donate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                charity_id: selectedCharity,
                amount_cents: finalAmount * 100,
                donor_name: name,
                donor_email: email,
                user_id: user?.id ?? null,
            }),
        })
        const json = await res.json()
        if (!res.ok) setError(json.error || 'Something went wrong.')
        else setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💚</div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-cream)', marginBottom: '12px' }}>Thank you!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                    Your donation of <strong style={{ color: 'var(--color-gold)' }}>€{finalAmount}</strong> has been recorded. Every euro makes a difference. ❤️
                </p>
                <a href="/charities" className="btn btn-primary">Explore more charities</a>
            </div>
        )
    }

    return (
        <form onSubmit={handleDonate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* Charity selector */}
            <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Choose a charity
                </label>
                <select
                    value={selectedCharity}
                    onChange={e => setSelectedCharity(e.target.value)}
                    className="input"
                    required
                >
                    <option value="">Select a charity…</option>
                    {charities.map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.category}</option>
                    ))}
                </select>
            </div>

            {/* Amount picker */}
            <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Donation amount
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {AMOUNTS.map(a => (
                        <button
                            key={a}
                            type="button"
                            onClick={() => { setAmount(a); setUseCustom(false) }}
                            style={{
                                padding: '10px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700,
                                border: `2px solid ${!useCustom && amount === a ? 'var(--color-gold)' : 'var(--border-medium)'}`,
                                background: !useCustom && amount === a ? 'rgba(212,168,83,0.12)' : 'transparent',
                                color: !useCustom && amount === a ? 'var(--color-gold)' : 'var(--text-secondary)',
                            }}
                        >
                            €{a}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setUseCustom(true)}
                        style={{
                            padding: '10px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700,
                            border: `2px solid ${useCustom ? 'var(--color-gold)' : 'var(--border-medium)'}`,
                            background: useCustom ? 'rgba(212,168,83,0.12)' : 'transparent',
                            color: useCustom ? 'var(--color-gold)' : 'var(--text-secondary)',
                        }}
                    >
                        Custom
                    </button>
                </div>
                {useCustom && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.2rem' }}>€</span>
                        <input
                            type="number"
                            min={1}
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="input"
                            style={{ maxWidth: '160px' }}
                            autoFocus
                        />
                    </div>
                )}
            </div>

            {/* Donor details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Full name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" className="input" required />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Email address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className="input" required />
                </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '16px 20px', background: 'rgba(212,168,83,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,168,83,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Donation to <strong style={{ color: 'var(--color-cream)' }}>
                        {charities.find(c => c.id === selectedCharity)?.name ?? 'selected charity'}
                    </strong>
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                    €{finalAmount}
                </span>
            </div>

            <button
                type="submit"
                className="btn btn-coral btn-lg"
                disabled={loading || finalAmount < 1}
                style={{ width: '100%' }}
            >
                {loading ? <Loader2 size={18} /> : <Heart size={18} />}
                {loading ? 'Processing…' : `Donate €${finalAmount}`}
            </button>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                This is a direct donation independent of any subscription or draw entry. 100% goes to the charity.
            </p>
        </form>
    )
}

export default function DonatePage() {
    return (
        <div className="page-content">
            <Navbar />

            <section style={{ paddingTop: '110px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '600px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div className="badge badge-red" style={{ marginBottom: '16px' }}>💝 Direct donation</div>
                        <h1 style={{ fontSize: '2.2rem', color: 'var(--color-cream)', marginBottom: '12px' }}>Give directly to a charity</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>
                            No subscription required. Make a one-off donation straight to an Irish charity of your choice.
                        </p>
                    </div>

                    <div className="glass" style={{ padding: '40px' }}>
                        <Suspense fallback={<div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />}>
                            <DonateForm />
                        </Suspense>
                    </div>
                </div>
            </section>
        </div>
    )
}
