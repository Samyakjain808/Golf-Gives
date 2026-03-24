import { adminSupabase } from './supabase/admin'
import type { Score } from '@/types'

const MAX_SCORES = 5

/**
 * Add a new score for a user.
 * Enforces rolling 5-score window: replaces the oldest score when limit reached.
 */
export async function addScore(
    userId: string,
    score: number,
    playedAt: string
): Promise<{ data: Score | null; error: string | null }> {
    if (score < 1 || score > 45) {
        return { data: null, error: 'Score must be between 1 and 45' }
    }

    // Fetch existing scores ordered oldest first
    const { data: existing, error: fetchError } = await adminSupabase
        .from('scores')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

    if (fetchError) {
        return { data: null, error: fetchError.message }
    }

    // If at capacity, delete the oldest
    if (existing && existing.length >= MAX_SCORES) {
        await adminSupabase.from('scores').delete().eq('id', existing[0].id)
    }

    const { data, error } = await adminSupabase
        .from('scores')
        .insert({ user_id: userId, score, played_at: playedAt })
        .select()
        .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

/**
 * Get a user's latest scores (newest first, max 5)
 */
export async function getUserScores(userId: string): Promise<Score[]> {
    const { data } = await adminSupabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_SCORES)

    return data ?? []
}

/**
 * Update an existing score
 */
export async function updateScore(
    scoreId: string,
    userId: string,
    score: number,
    playedAt: string
): Promise<{ error: string | null }> {
    if (score < 1 || score > 45) {
        return { error: 'Score must be between 1 and 45' }
    }

    const { error } = await adminSupabase
        .from('scores')
        .update({ score, played_at: playedAt })
        .eq('id', scoreId)
        .eq('user_id', userId) // security: users can only edit their own scores

    return { error: error?.message ?? null }
}

/**
 * Check if a user is eligible for a draw (needs 5 scores)
 */
export async function isEligibleForDraw(userId: string): Promise<boolean> {
    const { count } = await adminSupabase
        .from('scores')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

    return (count ?? 0) >= MAX_SCORES
}

/**
 * Get entry numbers from scores for draw participation
 * Returns the score values as entry numbers (1-45)
 */
export async function getEntryNumbers(userId: string): Promise<number[]> {
    const { data } = await adminSupabase
        .from('scores')
        .select('score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_SCORES)

    return data?.map((s: { score: number }) => s.score) ?? []
}
