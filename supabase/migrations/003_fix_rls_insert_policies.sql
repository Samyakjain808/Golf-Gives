-- ================================================================
-- PATCH: Fix RLS policies for INSERT operations
-- Run this in Supabase SQL Editor after previous migrations.
-- ================================================================

-- Fix: Scores INSERT policy needs explicit WITH CHECK clause
-- The FOR ALL USING-only policy may not properly authorize INSERTs
-- via the anon/authenticated client in all Supabase versions.
DO $$
BEGIN
    -- Drop the existing broad policy and create separate ones
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own scores' AND tablename = 'scores') THEN
        DROP POLICY "Users manage own scores" ON scores;
    END IF;
END $$;

CREATE POLICY "Users select own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Fix: user_charity_selections INSERT policy needs explicit WITH CHECK
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own charity selections' AND tablename = 'user_charity_selections') THEN
        DROP POLICY "Users manage own charity selections" ON user_charity_selections;
    END IF;
END $$;

CREATE POLICY "Users select own charity selections" ON user_charity_selections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own charity selections" ON user_charity_selections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own charity selections" ON user_charity_selections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own charity selections" ON user_charity_selections FOR DELETE USING (auth.uid() = user_id);
