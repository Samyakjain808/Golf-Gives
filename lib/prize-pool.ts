import type { DrawConfig } from '@/types'

export interface PrizePoolBreakdown {
    tier5Cents: number
    tier4Cents: number
    tier3Cents: number
    totalCents: number
    jackpotRolledOver: number
}

/**
 * Calculate prize pool distribution from subscription revenue + jackpot carryover
 */
export function calculatePrizePool(
    activeSubscribers: number,
    monthlyPriceCents: number,
    config: Pick<DrawConfig, 'prize_pool_pct' | 'tier5_pct' | 'tier4_pct' | 'tier3_pct'>,
    jackpotCarryoverCents = 0
): PrizePoolBreakdown {
    const subscriptionRevenue = activeSubscribers * monthlyPriceCents
    const poolContribution = Math.floor(subscriptionRevenue * config.prize_pool_pct / 100)
    const totalPool = poolContribution + jackpotCarryoverCents

    return {
        tier5Cents: Math.floor(totalPool * config.tier5_pct / 100),
        tier4Cents: Math.floor(totalPool * config.tier4_pct / 100),
        tier3Cents: Math.floor(totalPool * config.tier3_pct / 100),
        totalCents: totalPool,
        jackpotRolledOver: jackpotCarryoverCents,
    }
}

/**
 * Split a prize equally among winners (floor division — remainder stays in pool)
 */
export function splitPrize(totalCents: number, winnerCount: number): number {
    if (winnerCount === 0) return 0
    return Math.floor(totalCents / winnerCount)
}

/**
 * Format cents as currency string (EUR default)
 */
export function formatCents(cents: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100)
}

/**
 * Calculate charity contribution amount for a subscription payment
 */
export function calculateCharityAmount(
    subscriptionCents: number,
    contributionPct: number
): number {
    return Math.floor(subscriptionCents * contributionPct / 100)
}
