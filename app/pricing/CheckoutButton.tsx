'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CheckoutButton({ plan, isLoggedIn, highlight }: { plan: string; isLoggedIn: boolean; highlight: boolean }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleCheckout() {
        if (!isLoggedIn) {
            router.push(`/signup?plan=${plan}`)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert(data.error || 'Failed to start checkout. Please try again.')
                setLoading(false)
            }
        } catch (e) {
            alert('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={highlight ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Starting checkout…' : 'Get started →'}
        </button>
    )
}
