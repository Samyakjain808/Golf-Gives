import Link from 'next/link'

const STEPS = [
    {
        emoji: '1️⃣',
        title: 'Subscribe to GolfGives',
        description:
            'Choose a Monthly (€15) or Yearly (€150) plan and complete your Stripe-secured payment. Your subscription is what funds both the monthly prize pool and your chosen charity.',
        detail: '50% of your fee goes to the prize pool · up to 40% to your charity · remainder covers platform running costs.',
    },
    {
        emoji: '2️⃣',
        title: 'Choose your charity',
        description:
            'During signup (or any time in your dashboard) pick one of our verified Irish charity partners. Set how much of your subscription goes to them — the minimum is 10%, but you can give more.',
        detail: 'You can change your charity at any time; changes apply from the next billing cycle.',
    },
    {
        emoji: '3️⃣',
        title: 'Log your golf scores',
        description:
            'After each round, log your Stableford score (any number from 1 to 45). The system keeps your 5 most recent scores — when you add a 6th the oldest is automatically removed.',
        detail: 'Your 5 scores become your 5 entry numbers for that month\'s draw. You must have exactly 5 scores logged to be eligible.',
    },
    {
        emoji: '4️⃣',
        title: 'Monthly draw night',
        description:
            'On draw night, the admin randomly selects 5 unique numbers from 1–45. Every eligible subscriber\'s entry numbers are compared to the drawn numbers.',
        detail: 'Match 3 → 3rd prize (25% of pool) · Match 4 → 2nd prize (35%) · Match all 5 → Jackpot (40%).',
    },
    {
        emoji: '5️⃣',
        title: 'Winners are notified',
        description:
            'If you matched 3 or more numbers, you\'re a winner! You\'ll receive an email notification and see the prize in your dashboard. Upload a quick proof to verify your identity.',
        detail: 'Prizes are split equally among all winners at each tier. Once verified, payment is sent directly to you.',
    },
    {
        emoji: '6️⃣',
        title: 'Jackpot rollovers',
        description:
            'If nobody matches all 5 numbers, the jackpot tier rolls over and is added to the following month\'s prize pool — growing until someone wins it.',
        detail: '3-match and 4-match prizes are still paid out normally every month regardless of the jackpot.',
    },
]

const PRIZE_TIERS = [
    { matches: 5, label: 'Jackpot — 5 matched', share: 40, example: 1200, tier: 'tier-5', icon: '🏆' },
    { matches: 4, label: '2nd Prize — 4 matched', share: 35, example: 315, tier: 'tier-4', icon: '🥈' },
    { matches: 3, label: '3rd Prize — 3 matched', share: 25, example: 75, tier: 'tier-3', icon: '🥉' },
]

const FAQS = [
    {
        q: 'Do I need to be a member of a golf club?',
        a: 'No! GolfGives is open to any golfer anywhere. You just need to be able to record Stableford scores — whether at a club, a pay-and-play course, or even a casual round with friends.',
    },
    {
        q: 'How is the draw verified as fair?',
        a: 'The draw is run by the admin using our built-in draw engine which generates 5 cryptographically random numbers from 1–45. The results are stored immutably and published in full for all subscribers to verify.',
    },
    {
        q: 'Can I have more than 5 scores active at once?',
        a: 'No — only your 5 most recent scores are kept. When you submit a 6th score, the oldest one is automatically removed. This rolling window keeps the draw fresh and encourages regular play.',
    },
    {
        q: 'What happens if I miss a month?',
        a: 'As long as your subscription is active and you have 5 scores logged, you\'re automatically in the draw. If you haven\'t logged 5 scores in time for that month\'s draw, you simply won\'t have an entry that month.',
    },
    {
        q: 'When are draws run?',
        a: 'Draws are run once per month by the admin. Results are published to the site and winners are notified by email on draw night.',
    },
    {
        q: 'How quickly are prizes paid out?',
        a: 'After a winner submits their verification proof and admin approves it, payment is processed promptly. The typical turnaround is 2–5 business days.',
    },
]

export default function HowItWorksPage() {
    return (
        <div className="page-content">
            {/* NAVBAR */}
            <nav className="navbar">
                <a href="/" className="navbar-logo">
                    Golf<span>Gives</span>
                </a>
                <ul className="navbar-links">
                    <li><a href="/charities">Charities</a></li>
                    <li><a href="/how-it-works" style={{ color: 'var(--color-gold)' }}>How It Works</a></li>
                    <li><a href="/pricing">Pricing</a></li>
                </ul>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="/login" className="btn btn-secondary btn-sm">Log in</a>
                    <a href="/signup" className="btn btn-primary btn-sm">Join Now</a>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero-bg section" style={{ paddingTop: '130px', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div className="badge badge-green" style={{ marginBottom: '20px' }}>Clear & simple</div>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'var(--color-cream)', marginBottom: '20px' }}>
                        How <span className="text-gold">GolfGives</span> works
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                        Six straightforward steps from signup to winning. You play golf, support a cause, and are automatically entered in a monthly prize draw.
                    </p>
                </div>
            </section>

            {/* STEPS */}
            <section className="section">
                <div className="container" style={{ maxWidth: '860px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {STEPS.map((step, i) => (
                            <div
                                key={i}
                                className="glass"
                                style={{ display: 'flex', gap: '28px', padding: '32px', alignItems: 'flex-start' }}
                            >
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(212,168,83,0.12)', border: '1.5px solid rgba(212,168,83,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                                }}>
                                    {step.emoji}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.3rem', color: 'var(--color-cream)', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>
                                        {step.title}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>
                                        {step.description}
                                    </p>
                                    <div style={{
                                        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(212,168,83,0.07)', borderLeft: '3px solid var(--color-gold)',
                                        fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6,
                                    }}>
                                        {step.detail}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRIZE STRUCTURE */}
            <section className="section" style={{ background: 'rgba(0,0,0,0.15)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                        <div className="badge badge-gold" style={{ marginBottom: '16px' }}>Prize breakdown</div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-cream)' }}>How the prize pool is split</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '20px auto 0', fontSize: '1rem' }}>
                            With 100 active subscribers (€15/mo each), the example prize pool is €750. Here's how that's distributed:
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
                        {PRIZE_TIERS.map((tier, i) => (
                            <div key={i} className={`glass ${tier.tier}`} style={{ padding: '32px 24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{tier.icon}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-cream)', marginBottom: '16px' }}>{tier.label}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1 }}>
                                    {tier.share}%
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    e.g. <strong style={{ color: 'var(--text-secondary)' }}>€{tier.example}</strong> with 100 players
                                </div>
                            </div>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-muted)', maxWidth: '600px', margin: '32px auto 0' }}>
                        Prizes are split equally among all winners at each tier. If multiple people match 5 numbers, they share the jackpot. If no one matches 5, the jackpot rolls over and grows next month.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="section">
                <div className="container" style={{ maxWidth: '720px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-cream)' }}>Questions answered</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {FAQS.map((faq, i) => (
                            <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-cream)', marginBottom: '10px' }}>
                                    {faq.q}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-sm" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, transparent 100%)', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '16px' }}>Ready to get started?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem' }}>
                        Join thousands of golfers making a difference with every round.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/signup" className="btn btn-primary btn-lg">Join for €15/month</Link>
                        <Link href="/pricing" className="btn btn-secondary btn-lg">See all plans</Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="navbar-logo">Golf<span style={{ color: 'var(--color-gold)' }}>Gives</span></div>
                    <div style={{ display: 'flex', gap: '28px' }}>
                        {['/', '/charities', '/how-it-works', '/pricing', '/login'].map((href) => (
                            <a key={href} href={href} style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
                                {href === '/' ? 'Home' : href.slice(1).replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </a>
                        ))}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2025 GolfGives</div>
                </div>
            </footer>
        </div>
    )
}
