import Link from 'next/link'
import { Trophy, Heart, Zap, Users, TrendingUp, Award } from 'lucide-react'

const CHARITY_CAUSES = [
  { name: 'Irish Cancer Society', category: 'Health', raised: '€24,800', color: '#e85d4a' },
  { name: 'Focus Ireland', category: 'Homelessness', raised: '€18,200', color: '#d4a853' },
  { name: 'Pieta House', category: 'Mental Health', raised: '€31,500', color: '#4ade80' },
  { name: 'ISPCC', category: 'Children', raised: '€15,600', color: '#93c5fd' },
]

const HOW_IT_WORKS = [
  {
    icon: '🏌️',
    step: '01',
    title: 'Subscribe & Choose',
    desc: 'Pick a monthly (€15) or yearly (€150) plan and select your favourite Irish charity to support.',
  },
  {
    icon: '⛳',
    step: '02',
    title: 'Log Your Scores',
    desc: 'Enter your Stableford golf scores (1–45) after each round. Your 5 most recent scores are your draw numbers.',
  },
  {
    icon: '🎯',
    step: '03',
    title: 'Monthly Draw',
    desc: 'Each month, 5 numbers are drawn from 1–45. Match 3, 4 or all 5 to win cash prizes.',
  },
  {
    icon: '💝',
    step: '04',
    title: 'Charity Wins Too',
    desc: 'A portion of every subscription goes to your chosen charity. Even if you don\'t win, they do.',
  },
]

const PRIZE_TIERS = [
  { matches: 5, label: 'Jackpot', share: '40%', example: '€1,200', tier: 'tier-5' },
  { matches: 4, label: '2nd Prize', share: '35%', example: '€315', tier: 'tier-4' },
  { matches: 3, label: '3rd Prize', share: '25%', example: '€75', tier: 'tier-3' },
]

import Navbar from '@/app/components/Navbar'

export default function LandingPage() {
  return (
    <div className="page-content">
      <Navbar />

      {/* HERO */}
      <section className="hero-bg section" style={{ paddingTop: '140px' }}>
        <div className="container">
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <div className="badge badge-gold animate-fade-up" style={{ marginBottom: '24px' }}>
              🏆 €74,100 raised for charity this year
            </div>
            <h1
              className="animate-fade-up animate-delay-1"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '24px', color: 'var(--color-cream)' }}
            >
              Golf that <span className="text-gold">gives back</span> — every single month
            </h1>
            <p
              className="animate-fade-up animate-delay-2"
              style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.7 }}
            >
              Subscribe, log your Stableford scores, and enter our monthly prize draw — while a portion of your subscription goes directly to the Irish charity you choose.
            </p>
            <div className="animate-fade-up animate-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start for €15/mo
              </Link>
              <Link href="/how-it-works" className="btn btn-secondary btn-lg">
                See how it works
              </Link>
            </div>
          </div>

          {/* STATS */}
          <div
            className="glass animate-fade-up animate-delay-4"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '80px', overflow: 'hidden' }}
          >
            {[
              { num: '1,240+', label: 'Active subscribers' },
              { num: '€74k', label: 'Raised for charities' },
              { num: '8', label: 'Partner charities' },
              { num: '€12k', label: 'This month\'s prize pool' },
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{ borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div className="stat-number">{stat.num}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="badge badge-green" style={{ marginBottom: '16px' }}>Simple & transparent</div>
            <h2 style={{ fontSize: '2.75rem', color: 'var(--color-cream)' }}>How it works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="glass" style={{ padding: '32px 24px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{step.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: '8px' }}>
                  STEP {step.step}
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--color-cream)' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE TIERS */}
      <section className="section" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="badge badge-gold" style={{ marginBottom: '16px' }}>Monthly draw</div>
            <h2 style={{ fontSize: '2.75rem', color: 'var(--color-cream)', marginBottom: '16px' }}>Win real prizes</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
              The prize pool is split into 3 tiers based on how many numbers you match. No jackpot winner? It rolls over to next month!
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {PRIZE_TIERS.map((tier, i) => (
              <div key={i} className={`glass ${tier.tier}`} style={{ padding: '36px 28px', textAlign: 'center', position: 'relative' }}>
                {i === 0 && <div className="badge badge-gold" style={{ marginBottom: '16px' }}>🏆 Jackpot</div>}
                <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-gold)', lineHeight: 1 }}>
                  {tier.matches}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '4px' }}>
                  numbers matched
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-cream)', marginBottom: '4px' }}>
                  {tier.share} of pool
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  e.g. {tier.example} with 100 players
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITIES */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div className="badge badge-red" style={{ marginBottom: '16px' }}>Your choice</div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--color-cream)', marginBottom: '20px' }}>
                You choose which charity <span className="text-coral">benefits</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
                When you sign up, pick a charity from our verified list of Irish organisations. A minimum of 10% of your subscription goes directly to them — you can even choose to give more.
              </p>
              <Link href="/charities" className="btn btn-coral">
                <Heart size={16} />
                Browse charities
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {CHARITY_CAUSES.map((c, i) => (
                <div key={i} className="glass" style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '14px' }}>{c.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{c.category}</div>
                    </div>
                  </div>
                  <div style={{ color: c.color, fontWeight: 700, fontSize: '14px' }}>{c.raised}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.1) 0%, rgba(26,58,42,0.5) 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="badge badge-gold" style={{ marginBottom: '24px' }}>No commitment needed</div>
          <h2 style={{ fontSize: '3rem', color: 'var(--color-cream)', marginBottom: '20px' }}>
            Ready to play for good?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join 1,240+ golfers making a difference with every round they play. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">Get started — €15/mo</Link>
            <Link href="/pricing" className="btn btn-secondary btn-lg">View all plans</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '24px' }}>
            Cancel anytime · Stripe-secured payments · GDPR compliant
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="navbar-logo" style={{ marginBottom: '8px' }}>Golf<span style={{ color: 'var(--color-gold)' }}>Gives</span></div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Making golf count for good.</div>
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            {['Charities', 'How It Works', 'Pricing', 'Login'].map(link => (
              <a key={link} href={`/${link.toLowerCase().replace(/ /g, '-')}`} style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
                {link}
              </a>
            ))}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © 2025 GolfGives. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
