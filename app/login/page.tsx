'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) {
            setError(err.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', background: 'radial-gradient(ellipse at 30% 40%, rgba(42,90,64,0.3) 0%, transparent 60%), var(--bg-base)' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--color-cream)', textDecoration: 'none' }}>
                        Golf<span style={{ color: 'var(--color-gold)' }}>Gives</span>
                    </a>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>Welcome back</p>
                </div>

                <div className="glass-elevated" style={{ padding: '40px 36px' }}>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--color-cream)', textAlign: 'center' }}>Sign in</h1>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>
                        Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--color-gold)' }}>Join now</Link>
                    </p>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ marginTop: '8px', width: '100%' }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
