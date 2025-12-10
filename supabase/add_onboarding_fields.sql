-- Add onboarding tracking fields to members table
-- Run this in Supabase SQL Editor: https://qpyjujdwdkyvdmhpsyul.supabase.co

-- Add onboarding columns
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS first_class_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES members(id);

-- Create indexes for onboarding queries
CREATE INDEX IF NOT EXISTS idx_members_onboarding_completed ON members(onboarding_completed_at);
CREATE INDEX IF NOT EXISTS idx_members_first_class ON members(first_class_date);
CREATE INDEX IF NOT EXISTS idx_members_referred_by ON members(referred_by);

COMMENT ON COLUMN members.onboarding_completed_at IS 'When member completed full onboarding process';
COMMENT ON COLUMN members.onboarding_checklist IS 'JSON object tracking onboarding steps: {profile: true, first_class: false, etc}';
COMMENT ON COLUMN members.first_class_date IS 'Scheduled date/time for members first class';
COMMENT ON COLUMN members.referred_by IS 'Member who referred this person (for referral tracking)';
