-- Add QR code column to members table
-- Run this in Supabase SQL Editor

-- Add qr_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'qr_code'
  ) THEN
    ALTER TABLE members ADD COLUMN qr_code TEXT UNIQUE;
  END IF;
END $$;

-- Create index for faster QR code lookups
CREATE INDEX IF NOT EXISTS idx_members_qr_code ON members(qr_code) WHERE qr_code IS NOT NULL;

-- Done!
SELECT 'QR code column added to members table!' as status;
