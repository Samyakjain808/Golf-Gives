'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'

const CHARITIES = [
    { id: 'irishcancer', name: 'Irish Cancer Society', category: 'Health' },
    { id: 'focusireland', name: 'Focus Ireland', category: 'Homelessness' },
    { id: 'pieta', name: 'Pieta House', category: 'Mental Health' },
    { id: 'ispcc', name: 'ISPCC', category: 'Children' },
    { id: 'simon', name: 'Simon Community', category: 'Homelessness' },
    { id: 'aware', name: 'Aware', category: 'Mental Health' },
]

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState<1 | 2>(1)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [selectedCharity, setSelectedCharity] = useState('')
    const [contribPct, setContribPct] = useState(10)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleStep1(e: React.FormEvent) {
        e.preventDefault()
        if (!fullName || !email || password.length < 8) {
            setError('Please fill in all fields. Password must be at least 8 characters.')
            return
        }
        setError('')
        setStep(2)
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedCharity) {
            setError('Please select a charity.')
            return
        }
        setLoading(true)
        setError('')

        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        })

        if (err) {
            setError(err.message)
            setLoading(false)
        } else {
            router.push('/dashboard?welcome=1')
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', background: 'radial-gradient(ellipse at 70% 40%, rgba(42,90,64,0.3) 0%, transparent 60%), var(--bg-base)' }}>
            <div style={{ width: '100%', maxWidth: step === 2 ? '580px' : '440px', transition: 'max-width 0.4s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--color-cream)', textDecoration: 'none' }}>
                        Golf<span style={{ color: 'var(--color-gold)' }}>Gives</span>
                    </a>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>Create your account</p>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, background: step >= s ? 'var(--color-gold)' : 'var(--border-subtle)', color: step >= s ? 'var(--color-forest-dark)' : 'var(--text-muted)', transition: 'all 0.3s' }}>
                                {step > s ? <Check size={14} /> : s}
                            </div>
                            <span style={{ fontSize: '12px', color: step >= s ? 'var(--color-cream)' : 'var(--text-muted)', fontWeight: step >= s ? 600 : 400 }}>
                                {s === 1 ? 'Your details' : 'Choose charity'}
                            </span>
                            {s < 2 && <div style={{ width: 40, height: 2, background: step > 1 ? 'var(--color-gold)' : 'var(--border-subtle)', borderRadius: 2, transition: 'background 0.3s' }} />}
                        </div>
                    ))}
                </div>

                <div className="glass-elevated" style={{ padding: '40px 36px' }}>
                    {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h1 style={{ fontSize: '1.6rem', marginBottom: '4px', color: 'var(--color-cream)' }}>Create account</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                                Already have an account? <Link href="/login" style={{ color: 'var(--color-gold)' }}>Sign in</Link>
                            </p>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Full name</label>
                                <input id="full-name" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" className="input" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Email address</label>
                                <input id="signup-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input id="signup-password" type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="input" style={{ paddingRight: '44px' }} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button id="signup-next" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                                Continue →
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: 'var(--color-cream)' }}>Choose your charity</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>A portion of your subscription goes directly to them every month.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {CHARITIES.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setSelectedCharity(c.id)}
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: 'var(--radius-md)',
                                            border: `2px solid ${selectedCharity === c.id ? 'var(--color-gold)' : 'var(--border-subtle)'}`,
                                            background: selectedCharity === c.id ? 'rgba(212,168,83,0.1)' : 'transparent',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: selectedCharity === c.id ? 'var(--color-gold)' : 'var(--color-cream)' }}>{c.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{c.category}</div>
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                    Charity contribution: <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{contribPct}%</span> of subscription
                                </label>
                                <input type="range" min={10} max={50} step={5} value={contribPct} onChange={e => setContribPct(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    <span>Min 10%</span><span>50%</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>← Back</button>
                                <button id="signup-submit" type="submit" className="btn btn-primary" disabled={loading || !selectedCharity} style={{ flex: 2 }}>
                                    {loading ? <Loader2 size={18} /> : null}
                                    {loading ? 'Creating account…' : 'Create account & subscribe'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
