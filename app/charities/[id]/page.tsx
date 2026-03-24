import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Heart, Users, Globe } from 'lucide-react'

import Navbar from '@/app/components/Navbar'

export default async function CharityProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const [{ data: charity }, { data: contributions }] = await Promise.all([
        supabase.from('charities').select('*').eq('id', id).eq('is_active', true).single(),
        supabase
            .from('charity_contributions')
            .select('amount_cents')
            .eq('charity_id', id),
    ])

    if (!charity) notFound()

    const totalRaised = (contributions ?? []).reduce((sum: number, c: any) => sum + c.amount_cents, 0)
    const supporterCount = new Set((contributions ?? []).map((c: any) => c.user_id)).size

    const CATEGORY_EMOJI: Record<string, string> = {
        Health: '🏥', Homelessness: '🏠', 'Mental Health': '🧠',
        Children: '👶', Disability: '♿', International: '🌍', Default: '❤️',
    }
    const emoji = CATEGORY_EMOJI[charity.category] ?? CATEGORY_EMOJI.Default

    return (
        <div className="page-content">
            {/* NAVBAR */}
            <Navbar active="charities" />

            <section style={{ paddingTop: '110px', paddingBottom: '80px' }}>
                <div className="container" style={{ maxWidth: '860px' }}>

                    {/* Back */}
                    <Link href="/charities" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
                        ← Back to charities
                    </Link>

                    {/* Header card */}
                    <div className="glass-elevated" style={{ padding: '40px', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'rgba(212,168,83,0.12)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>
                                {emoji}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="badge badge-gold" style={{ marginBottom: '10px' }}>{charity.category}</div>
                                <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>{charity.name}</h1>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>{charity.description}</p>
                                {charity.website_url && (
                                    <a href={charity.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)', fontSize: '14px', textDecoration: 'none', marginTop: '16px' }}>
                                        <Globe size={14} /> Visit official website <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                        {[
                            { icon: '💰', label: 'Total raised via GolfGives', value: totalRaised > 0 ? `€${(totalRaised / 100).toLocaleString()}` : 'Be the first!' },
                            { icon: '👥', label: 'Supporters on platform', value: supporterCount > 0 ? `${supporterCount}+` : '—' },
                            { icon: '🇮🇪', label: 'Country', value: charity.country ?? 'Ireland' },
                        ].map((stat, i) => (
                            <div key={i} className="glass" style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{stat.icon}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1, marginBottom: '6px' }}>{stat.value}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* How contributions work */}
                    <div className="glass" style={{ padding: '32px', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '1.3rem', color: 'var(--color-cream)', marginBottom: '20px' }}>How your support works</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {[
                                { icon: '🏌️', title: 'Via subscription', desc: 'When you subscribe and choose this charity, a minimum of 10% of your monthly fee goes directly to them every billing cycle.' },
                                { icon: '💝', title: 'Via direct donation', desc: 'You can also make a one-off donation to this charity at any time — completely separate from your subscription or draw entry.' },
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '20px', background: 'rgba(212,168,83,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{item.icon}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-cream)', marginBottom: '8px', fontSize: '15px' }}>{item.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="glass tier-5" style={{ padding: '36px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❤️</div>
                        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-cream)', marginBottom: '12px' }}>
                            Support {charity.name}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                            Subscribe to GolfGives and choose this charity — or make a direct donation right now.
                        </p>
                        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href={`/signup?charity=${charity.id}`} className="btn btn-primary btn-lg">
                                <Heart size={16} /> Subscribe & support
                            </Link>
                            <Link href={`/donate?charity=${charity.id}`} className="btn btn-coral">
                                💝 Donate directly
                            </Link>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    )
}
