-- ================================================================
-- Golf Charity Platform - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- PROFILES (extends auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  country       TEXT DEFAULT 'IE',
  handicap      NUMERIC(4,1),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SUBSCRIPTIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan                   TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('active', 'inactive', 'cancelled', 'lapsed', 'trialing', 'pending')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ================================================================
-- SCORES
-- ================================================================
CREATE TABLE IF NOT EXISTS scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score       SMALLINT NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at   DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scores_user_created ON scores(user_id, created_at DESC);

-- ================================================================
-- CHARITIES
-- ================================================================
CREATE TABLE IF NOT EXISTS charities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  logo_url     TEXT,
  website_url  TEXT,
  country      TEXT DEFAULT 'IE',
  category     TEXT,
  is_featured  BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- USER CHARITY SELECTIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS user_charity_selections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id       UUID NOT NULL REFERENCES charities(id),
  contribution_pct SMALLINT NOT NULL DEFAULT 10 CHECK (contribution_pct >= 10 AND contribution_pct <= 100),
  is_active        BOOLEAN DEFAULT TRUE,
  selected_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_charity_sel_user ON user_charity_selections(user_id, is_active);

-- ================================================================
-- DRAWS
-- ================================================================
CREATE TABLE IF NOT EXISTS draws (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month       DATE NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'simulated', 'published')),
  drawn_numbers    SMALLINT[] NOT NULL DEFAULT '{}',
  prize_pool_cents BIGINT NOT NULL DEFAULT 0,
  jackpot_cents    BIGINT NOT NULL DEFAULT 0,
  jackpot_rolled   BOOLEAN DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- DRAW ENTRIES
-- ================================================================
CREATE TABLE IF NOT EXISTS draw_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id       UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id),
  entry_numbers SMALLINT[] NOT NULL,
  match_count   SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user ON draw_entries(user_id);

-- ================================================================
-- PRIZES
-- ================================================================
CREATE TABLE IF NOT EXISTS prizes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id          UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_tier       SMALLINT NOT NULL CHECK (match_tier IN (3, 4, 5)),
  total_cents      BIGINT NOT NULL,
  winner_count     INT NOT NULL DEFAULT 0,
  UNIQUE(draw_id, match_tier)
);

-- ================================================================
-- WINNERS
-- ================================================================
CREATE TABLE IF NOT EXISTS winners (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id             UUID NOT NULL REFERENCES draws(id),
  user_id             UUID NOT NULL REFERENCES profiles(id),
  match_tier          SMALLINT NOT NULL CHECK (match_tier IN (3, 4, 5)),
  prize_cents         BIGINT NOT NULL,
  proof_url           TEXT,
  verification_status TEXT DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status      TEXT DEFAULT 'pending'
                        CHECK (payment_status IN ('pending', 'paid')),
  verified_at         TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_winners_user ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw ON winners(draw_id);

-- ================================================================
-- CHARITY CONTRIBUTIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS charity_contributions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES profiles(id),
  charity_id               UUID NOT NULL REFERENCES charities(id),
  amount_cents             BIGINT NOT NULL,
  source                   TEXT NOT NULL CHECK (source IN ('subscription', 'donation')),
  period_month             DATE,
  stripe_payment_intent_id TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contributions_charity ON charity_contributions(charity_id);

-- ================================================================
-- DRAW CONFIG (singleton row)
-- ================================================================
CREATE TABLE IF NOT EXISTS draw_config (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_pool_pct       SMALLINT NOT NULL DEFAULT 50,
  charity_pct_min      SMALLINT NOT NULL DEFAULT 10,
  tier5_pct            SMALLINT NOT NULL DEFAULT 40,
  tier4_pct            SMALLINT NOT NULL DEFAULT 35,
  tier3_pct            SMALLINT NOT NULL DEFAULT 25,
  use_weighted         BOOLEAN DEFAULT FALSE,
  monthly_price_cents  INT NOT NULL DEFAULT 1500,
  yearly_price_cents   INT NOT NULL DEFAULT 15000,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO draw_config DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access subscriptions" ON subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scores" ON scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin full access scores" ON scores FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Charities (public read, admin write)
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active charities" ON charities FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access charities" ON charities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- User Charity Selections
ALTER TABLE user_charity_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own charity selections" ON user_charity_selections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read all selections" ON user_charity_selections FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Draws (published draws public, admin all)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access draws" ON draws FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Draw Entries
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access entries" ON draw_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Prizes (public read for published draws)
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prizes" ON prizes FOR SELECT USING (true);
CREATE POLICY "Admin full access prizes" ON prizes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Winners
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own proof" ON winners FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access winners" ON winners FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Charity Contributions
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin full access contributions" ON charity_contributions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Draw Config (public read, admin write)
ALTER TABLE draw_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read config" ON draw_config FOR SELECT USING (true);
CREATE POLICY "Admin full access config" ON draw_config FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================================
-- TRIGGERS: auto-update updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- FUNCTION: auto-create profile on signup
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- SEED DATA: Sample Charities
-- ================================================================
INSERT INTO charities (name, description, category, country, is_featured, website_url) VALUES
('Irish Cancer Society', 'Supporting those affected by cancer across Ireland with research, support, and education.', 'Health', 'IE', true, 'https://www.cancer.ie'),
('Focus Ireland', 'Working to prevent homelessness and support people out of homelessness across Ireland.', 'Homelessness', 'IE', false, 'https://www.focusireland.ie'),
('Enable Ireland', 'Providing services to children and adults with disabilities across Ireland.', 'Disability', 'IE', false, 'https://www.enableireland.ie'),
('Pieta House', 'Providing professional, compassionate therapy to people in suicidal distress.', 'Mental Health', 'IE', false, 'https://www.pieta.ie'),
('ISPCC', 'Protecting children and enabling them to live lives free from abuse and neglect.', 'Children', 'IE', false, 'https://www.ispcc.ie'),
('Simon Community', 'Responding to homelessness with housing, support, and hope across Ireland.', 'Homelessness', 'IE', false, 'https://www.simoncommunity.com'),
('Barnardos Ireland', 'Supporting vulnerable children and families to reach their potential.', 'Children', 'IE', false, 'https://www.barnardos.ie'),
('Aware', 'Providing support, education and information for those affected by depression.', 'Mental Health', 'IE', false, 'https://www.aware.ie')
ON CONFLICT DO NOTHING;
