import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: '€15',
        period: '/month',
        yearlyPrice: null,
        highlight: false,
        features: [
            'Enter monthly prize draw',
            'Log Stableford scores',
            'Support your chosen charity',
            'Access subscriber dashboard',
            'Cancel any time',
        ],
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '€150',
        period: '/year',
        yearlyPrice: '€12.50/mo',
        highlight: true,
        badge: '2 months free',
        features: [
            'Everything in Monthly',
            '2 months free (save €30)',
            'Priority charity matching',
            'Exclusive yearly badge',
            'Early access to new features',
        ],
    },
]

export default function PricingPage() {
    return (
        <div className="page-content">
            <nav className="navbar">
                <a href="/" className="navbar-logo">Golf<span>Gives</span></a>
                <ul className="navbar-links">
                    <li><a href="/charities">Charities</a></li>
                    <li><a href="/how-it-works">How It Works</a></li>
                    <li><a href="/pricing" style={{ color: 'var(--color-gold)' }}>Pricing</a></li>
                </ul>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="/login" className="btn btn-secondary btn-sm">Log in</a>
                    <a href="/signup" className="btn btn-primary btn-sm">Join Now</a>
                </div>
            </nav>

            <section className="section" style={{ paddingTop: '120px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <div className="badge badge-gold" style={{ marginBottom: '16px' }}>Simple pricing</div>
                        <h1 style={{ fontSize: '3rem', color: 'var(--color-cream)', marginBottom: '16px' }}>
                            One subscription, real impact
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '1.05rem' }}>
                            Your monthly fee funds the prize pool and your chosen charity. No surprises, no hidden fees.
                        </p>
                    </div>

                    {/* Plans */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '760px', margin: '0 auto 80px' }}>
                        {PLANS.map(plan => (
                            <div
                                key={plan.id}
                                className={plan.highlight ? 'glass-elevated' : 'glass'}
                                style={{
                                    padding: '40px 36px',
                                    position: 'relative',
                                    ...(plan.highlight ? { border: '2px solid rgba(212,168,83,0.4)' } : {}),
                                }}
                            >
                                {plan.badge && (
                                    <div className="badge badge-gold" style={{ marginBottom: '16px' }}>
                                        <Zap size={12} style={{ marginRight: '4px' }} />
                                        {plan.badge}
                                    </div>
                                )}
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>{plan.name}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1 }}>{plan.price}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{plan.period}</span>
                                </div>
                                {plan.yearlyPrice && (
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '28px' }}>That's {plan.yearlyPrice}</div>
                                )}
                                {!plan.yearlyPrice && <div style={{ marginBottom: '28px' }} />}
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {plan.features.map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(212,168,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Check size={12} style={{ color: 'var(--color-gold)' }} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/signup?plan=${plan.id}`}
                                    id={`cta-${plan.id}`}
                                    className={plan.highlight ? 'btn btn-primary' : 'btn btn-secondary'}
                                    style={{ width: '100%', textAlign: 'center' }}
                                >
                                    Get started →
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Trust bar */}
                    <div className="glass" style={{ padding: '28px 40px', display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
                        {[
                            { icon: '🔒', label: 'Stripe-secured payments' },
                            { icon: '❌', label: 'Cancel any time' },
                            { icon: '🇮🇪', label: 'Irish-registered charities' },
                            { icon: '🛡️', label: 'GDPR compliant' },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{item.icon}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ */}
                    <div style={{ maxWidth: '660px', margin: '80px auto 0' }}>
                        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '40px', color: 'var(--color-cream)' }}>Common questions</h2>
                        {[
                            { q: 'Where does my money go?', a: '50% goes into the monthly prize pool, up to 40% goes to your chosen charity (minimum 10% — you choose the exact %, plus a portion covers platform costs.' },
                            { q: 'What if no one matches 5 numbers?', a: 'The jackpot rolls over to next month, growing until someone wins it. The 4-match and 3-match prizes are still paid out normally.' },
                            { q: 'Can I change my charity?', a: 'Yes, you can change your chosen charity at any time from your subscriber dashboard.' },
                            { q: 'How is the draw fair?', a: 'Your Stableford scores (1–45) are your entry numbers, based on your actual golf performance. 5 random numbers are drawn each month by the admin, fully logged.' },
                        ].map((faq, i) => (
                            <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-cream)', marginBottom: '10px' }}>{faq.q}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
