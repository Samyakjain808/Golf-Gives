import { adminSupabase } from './supabase/admin'
import { getEntryNumbers, isEligibleForDraw } from './score-engine'
import { calculatePrizePool, splitPrize } from './prize-pool'
import type { DrawConfig, DrawEntry, Prize } from '@/types'

export interface DrawResult {
    drawnNumbers: number[]
    tier5Winners: DrawEntry[]
    tier4Winners: DrawEntry[]
    tier3Winners: DrawEntry[]
    prizes: { tier: 3 | 4 | 5; totalCents: number; perWinnerCents: number; count: number }[]
    jackpotRolled: boolean
}

/**
 * Generate 5 unique random numbers from 1–45
 */
export function generateRandomNumbers(): number[] {
    const pool = Array.from({ length: 45 }, (_, i) => i + 1)
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, 5).sort((a, b) => a - b)
}

/**
 * Weighted draw: numbers that appear more frequently in scores get higher probability
 * Optional enhancement over pure random
 */
export function generateWeightedNumbers(allScores: number[]): number[] {
    if (allScores.length === 0) return generateRandomNumbers()

    const frequency: Record<number, number> = {}
    allScores.forEach(s => { frequency[s] = (frequency[s] ?? 0) + 1 })

    // Build weighted pool
    const weightedPool: number[] = []
    for (let n = 1; n <= 45; n++) {
        // Base weight 1 for all, +frequency weight for popular numbers
        const weight = 1 + (frequency[n] ?? 0)
        for (let i = 0; i < weight; i++) weightedPool.push(n)
    }

    // Shuffle and pick 5 unique
    const picked = new Set<number>()
    let attempts = 0
    while (picked.size < 5 && attempts < 10000) {
        const idx = Math.floor(Math.random() * weightedPool.length)
        picked.add(weightedPool[idx])
        attempts++
    }

    // Fallback to pure random if something went wrong
    if (picked.size < 5) return generateRandomNumbers()
    return Array.from(picked).sort((a, b) => a - b)
}

/**
 * Count how many numbers match between user entry and drawn numbers
 */
export function countMatches(userNumbers: number[], drawnNumbers: number[]): number {
    const drawn = new Set(drawnNumbers)
    return userNumbers.filter(n => drawn.has(n)).length
}

/**
 * Build draw entries for all eligible subscribers
 */
export async function buildDrawEntries(drawId: string): Promise<void> {
    // Get all active subscribers
    const { data: subscribers } = await adminSupabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active')

    if (!subscribers) return

    for (const { user_id } of subscribers) {
        const eligible = await isEligibleForDraw(user_id)
        if (!eligible) continue

        const numbers = await getEntryNumbers(user_id)

        // Upsert draw entry
        await adminSupabase.from('draw_entries').upsert({
            draw_id: drawId,
            user_id,
            entry_numbers: numbers,
            match_count: 0,
        }, { onConflict: 'draw_id,user_id' })
    }
}

/**
 * Execute a draw (simulation or final)
 * Returns the full result without persisting if simulate=true
 */
export async function executeDraw(
    drawId: string,
    config: DrawConfig,
    simulate = false
): Promise<DrawResult> {
    // Fetch all active subscriber count for prize pool
    const { count: activeCount } = await adminSupabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')

    // Fetch previous jackpot carryover
    const { data: draw } = await adminSupabase
        .from('draws')
        .select('jackpot_cents')
        .eq('id', drawId)
        .single()

    const jackpotCarryover = draw?.jackpot_cents ?? 0

    // Calculate prize pool
    const pool = calculatePrizePool(
        activeCount ?? 0,
        config.monthly_price_cents,
        config,
        jackpotCarryover
    )

    // Generate draw numbers
    let drawnNumbers: number[]
    if (config.use_weighted) {
        // Fetch all scores for weighted probability
        const { data: allScores } = await adminSupabase.from('scores').select('score')
        const scoreValues = allScores?.map((s: { score: number }) => s.score) ?? []
        drawnNumbers = generateWeightedNumbers(scoreValues)
    } else {
        drawnNumbers = generateRandomNumbers()
    }

    // Build entries if not simulating
    if (!simulate) {
        await buildDrawEntries(drawId)
    }

    // Fetch draw entries
    const { data: entries } = await adminSupabase
        .from('draw_entries')
        .select('*, profile:profiles(id, full_name, email)')
        .eq('draw_id', drawId)

    if (!entries) {
        return { drawnNumbers, tier5Winners: [], tier4Winners: [], tier3Winners: [], prizes: [], jackpotRolled: false }
    }

    // Update match counts
    const enrichedEntries = entries.map((entry: DrawEntry) => ({
        ...entry,
        match_count: countMatches(entry.entry_numbers, drawnNumbers),
    }))

    const tier5 = enrichedEntries.filter((e: DrawEntry) => e.match_count === 5)
    const tier4 = enrichedEntries.filter((e: DrawEntry) => e.match_count === 4)
    const tier3 = enrichedEntries.filter((e: DrawEntry) => e.match_count === 3)

    const jackpotRolled = tier5.length === 0

    // Calculate per-winner prizes
    const prizes = [
        {
            tier: 5 as const,
            totalCents: jackpotRolled ? 0 : pool.tier5Cents,
            perWinnerCents: splitPrize(pool.tier5Cents, tier5.length),
            count: tier5.length,
        },
        {
            tier: 4 as const,
            totalCents: pool.tier4Cents,
            perWinnerCents: splitPrize(pool.tier4Cents, tier4.length),
            count: tier4.length,
        },
        {
            tier: 3 as const,
            totalCents: pool.tier3Cents,
            perWinnerCents: splitPrize(pool.tier3Cents, tier3.length),
            count: tier3.length,
        },
    ]

    if (!simulate) {
        // Persist results to DB
        await adminSupabase.from('draws').update({
            drawn_numbers: drawnNumbers,
            prize_pool_cents: pool.totalCents,
            jackpot_rolled: jackpotRolled,
            // If jackpot rolled, carry tier5 pool forward to next draw
            jackpot_cents: jackpotRolled ? pool.tier5Cents : 0,
        }).eq('id', drawId)

        // Update match counts on entries
        for (const entry of enrichedEntries) {
            await adminSupabase.from('draw_entries')
                .update({ match_count: entry.match_count })
                .eq('id', entry.id)
        }

        // Create prize records
        for (const prize of prizes) {
            await adminSupabase.from('prizes').upsert({
                draw_id: drawId,
                match_tier: prize.tier,
                total_cents: prize.totalCents,
                winner_count: prize.count,
            }, { onConflict: 'draw_id,match_tier' })
        }

        // Create winner records for tier 3,4,5
        const allWinners = [...tier5, ...tier4, ...tier3]
        for (const winner of allWinners) {
            const prize = prizes.find(p => p.tier === winner.match_count)
            if (!prize || prize.perWinnerCents === 0) continue

            await adminSupabase.from('winners').upsert({
                draw_id: drawId,
                user_id: winner.user_id,
                match_tier: winner.match_count,
                prize_cents: prize.perWinnerCents,
                verification_status: 'pending',
                payment_status: 'pending',
            }, { onConflict: 'draw_id,user_id' })
        }
    }

    return {
        drawnNumbers,
        tier5Winners: tier5,
        tier4Winners: tier4,
        tier3Winners: tier3,
        prizes,
        jackpotRolled,
    }
}
