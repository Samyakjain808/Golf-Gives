import { createClient } from '@/lib/supabase/server'
import Navbar from '@/app/components/Navbar'

export default async function CharitiesPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
    const supabase = await createClient()
    const params = await searchParams
    const { category, q } = params

    let query = supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }).order('name')
    if (category) query = query.eq('category', category)
    if (q) query = query.ilike('name', `%${q}%`)

    const { data: charities } = await query

    const CATEGORIES = ['Health', 'Homelessness', 'Mental Health', 'Children', 'Disability', 'International']

    return (
        <div className="page-content">
            <Navbar active="charities" />

            <section className="section" style={{ paddingTop: '120px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <div className="badge badge-red" style={{ marginBottom: '16px' }}>❤️ Our partners</div>
                        <h1 style={{ fontSize: '3rem', color: 'var(--color-cream)', marginBottom: '16px' }}>Choose your cause</h1>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto', fontSize: '1.05rem' }}>
                            Every subscriber supports a verified Irish charity. Browse our partners and find the cause that speaks to you.
                        </p>
                    </div>

                    {/* Filters */}
                    <form method="GET" style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                            name="q"
                            defaultValue={q}
                            placeholder="Search charities…"
                            className="input"
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <select name="category" defaultValue={category || ''} className="input" style={{ width: 'auto', minWidth: '180px' }}>
                            <option value="">All categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button type="submit" className="btn btn-primary">Filter</button>
                        {(category || q) && <a href="/charities" className="btn btn-secondary">Clear</a>}
                    </form>

                    {/* Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {charities && charities.length > 0 ? charities.map((charity: any) => (
                            <div key={charity.id} className="glass" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                                {charity.is_featured && (
                                    <div className="badge badge-gold" style={{ position: 'absolute', top: '16px', right: '16px' }}>Featured</div>
                                )}
                                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'rgba(212,168,83,0.1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                    ❤️
                                </div>
                                <div>
                                    <div className="charity-card-tag">{charity.category}</div>
                                    <h3 style={{ fontSize: '1.2rem', marginTop: '6px', color: 'var(--color-cream)' }}>{charity.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
                                        {charity.description}
                                    </p>
                                </div>
                                {charity.website_url && (
                                    <a href={charity.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        Visit website ↗
                                    </a>
                                )}
                                <a href="/signup" className="btn btn-secondary btn-sm" style={{ marginTop: 'auto', textAlign: 'center' }}>
                                    Support this charity
                                </a>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                                No charities found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
