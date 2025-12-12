-- Add one-click login column to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS one_click_login_enabled BOOLEAN DEFAULT FALSE;

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_members_one_click_login
ON members(one_click_login_enabled)
WHERE one_click_login_enabled = TRUE;

-- Comment for documentation
COMMENT ON COLUMN members.one_click_login_enabled IS 'When enabled, member appears in quick login list on member portal';
