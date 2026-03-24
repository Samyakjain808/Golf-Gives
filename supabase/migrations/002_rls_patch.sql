-- ================================================================
-- PATCH: Missing RLS Policies
-- Run this in Supabase SQL Editor after the initial schema migration.
-- ================================================================

-- 1. Allow authenticated users to insert their own charity contributions
CREATE POLICY "Users insert own contributions"
  ON charity_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 2. Allow users to insert their own profile (fallback if trigger is slow)
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
