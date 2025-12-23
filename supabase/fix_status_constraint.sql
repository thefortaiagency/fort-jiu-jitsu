-- =====================================================
-- FIX: Add 'pending' to members status check constraint
-- =====================================================
-- Run this in Supabase SQL Editor
--
-- Issue: Signup fails with "violates check constraint members_status_check"
-- Cause: The status check constraint doesn't include 'pending'
-- Solution: Drop and recreate with 'pending' included
-- =====================================================

-- Drop the old constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;

-- Recreate with 'pending' included
ALTER TABLE members ADD CONSTRAINT members_status_check
CHECK (status IN ('active', 'inactive', 'pending', 'cancelled'));

-- Verify the fix
SELECT 'Status constraint updated to include: active, inactive, pending, cancelled' as status;
