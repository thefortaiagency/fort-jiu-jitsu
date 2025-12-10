-- Add waivers table for The Fort Jiu-Jitsu
-- Run this in Supabase SQL Editor: https://qpyjujdwdkyvdmhpsyul.supabase.co

-- Create waivers table to track signed liability waivers
CREATE TABLE IF NOT EXISTS waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,

  -- Waiver details
  waiver_type VARCHAR(100) NOT NULL DEFAULT 'liability', -- 'liability', 'medical', 'photo_release'
  waiver_version VARCHAR(20) DEFAULT '1.0',

  -- Signer information (may differ from member for minors)
  signer_name VARCHAR(200) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,
  signer_relationship VARCHAR(100), -- 'self', 'parent', 'guardian'

  -- Signature data
  signature_data TEXT, -- Base64 encoded signature image
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Legal tracking
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_waivers_member ON waivers(member_id);
CREATE INDEX IF NOT EXISTS idx_waivers_type ON waivers(waiver_type);
CREATE INDEX IF NOT EXISTS idx_waivers_signed_at ON waivers(signed_at);

-- Enable Row Level Security
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to waivers" ON waivers
  FOR ALL USING (auth.role() = 'service_role');

-- Members can view their own waivers
CREATE POLICY "Members can view own waivers" ON waivers
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

COMMENT ON TABLE waivers IS 'Stores signed liability waivers for The Fort Jiu-Jitsu members';
