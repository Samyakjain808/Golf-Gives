-- ================================================================
-- PATCH: Draw Visibility Controls
-- Adds 'visible' status for admin-controlled user visibility.
-- Run this in Supabase SQL Editor after previous migrations.
-- ================================================================

-- 1. Expand the status CHECK constraint to include 'visible'
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_status_check;
ALTER TABLE draws ADD CONSTRAINT draws_status_check
  CHECK (status IN ('pending', 'simulated', 'published', 'visible'));

-- 2. Add visible_at timestamp column
ALTER TABLE draws ADD COLUMN IF NOT EXISTS visible_at TIMESTAMPTZ;

-- 3. Auto-promote existing published draws to visible
--    so current users don't lose access to already-released results
UPDATE draws
  SET status = 'visible',
      visible_at = COALESCE(published_at, NOW())
  WHERE status = 'published';

-- 4. Update RLS: users can only see 'visible' draws (not just 'published')
DROP POLICY IF EXISTS "Public read published draws" ON draws;
CREATE POLICY "Public read visible draws" ON draws
  FOR SELECT USING (status = 'visible');

-- Admin full access policy is unchanged — admins see all statuses.
