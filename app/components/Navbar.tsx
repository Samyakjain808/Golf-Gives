'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Navbar({ active }: { active?: 'charities' | 'how-it-works' | 'pricing' }) {
    const [user, setUser] = useState<any>(undefined)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <nav className="navbar">
            <Link href="/" className="navbar-logo">
                Golf<span>Gives</span>
            </Link>
            <ul className="navbar-links">
                <li><Link href="/charities" style={{ color: active === 'charities' ? 'var(--color-gold)' : undefined }}>Charities</Link></li>
                <li><Link href="/how-it-works" style={{ color: active === 'how-it-works' ? 'var(--color-gold)' : undefined }}>How It Works</Link></li>
                <li><Link href="/pricing" style={{ color: active === 'pricing' ? 'var(--color-gold)' : undefined }}>Pricing</Link></li>
            </ul>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {user === undefined ? (
                    <div style={{ width: '136px', height: '36px' }} /> // Prevents layout shift
                ) : user ? (
                    <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                ) : (
                    <>
                        <Link href="/login" className="btn btn-secondary btn-sm">Log in</Link>
                        <Link href="/signup" className="btn btn-primary btn-sm">Join Now</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
