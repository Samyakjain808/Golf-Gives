export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed' | 'trialing' | 'pending'
export type PlanType = 'monthly' | 'yearly'
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  country: string
  handicap: number | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: PlanType
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  played_at: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  country: string
  category: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export interface UserCharitySelection {
  id: string
  user_id: string
  charity_id: string
  contribution_pct: number
  is_active: boolean
  selected_at: string
  charity?: Charity
}

export interface Draw {
  id: string
  draw_month: string
  status: DrawStatus
  drawn_numbers: number[]
  prize_pool_cents: number
  jackpot_cents: number
  jackpot_rolled: boolean
  published_at: string | null
  created_at: string
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  entry_numbers: number[]
  match_count: number
  created_at: string
  profile?: Profile
}

export interface Prize {
  id: string
  draw_id: string
  match_tier: 3 | 4 | 5
  total_cents: number
  winner_count: number
  per_winner_cents: number
}

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_tier: 3 | 4 | 5
  prize_cents: number
  proof_url: string | null
  verification_status: VerificationStatus
  payment_status: PaymentStatus
  verified_at: string | null
  paid_at: string | null
  created_at: string
  profile?: Profile
  draw?: Draw
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  amount_cents: number
  source: 'subscription' | 'donation'
  period_month: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  charity?: Charity
}

export interface DrawConfig {
  id: string
  prize_pool_pct: number
  charity_pct_min: number
  tier5_pct: number
  tier4_pct: number
  tier3_pct: number
  use_weighted: boolean
  monthly_price_cents: number
  yearly_price_cents: number
  updated_at: string
}

export interface DashboardData {
  profile: Profile
  subscription: Subscription | null
  scores: Score[]
  charitySelection: UserCharitySelection | null
  recentDraw: Draw | null
  myEntry: DrawEntry | null
  winnings: Winner[]
}

export interface AdminAnalytics {
  totalUsers: number
  activeSubscribers: number
  totalPrizePool: number
  totalCharityContributions: number
  drawStats: {
    total: number
    published: number
    averageWinners: number
  }
  monthlyRevenue: number
}
