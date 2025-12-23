-- =====================================================
-- ADD FACILITY FIELD FOR UNIFIED MEMBERSHIP SYSTEM
-- =====================================================
-- This allows tracking which facility a member belongs to:
-- - wrestling: The Fort Wrestling (1519 Goshen Road)
-- - jiujitsu: The Fort Jiu-Jitsu (1724 Prairie Lane)
-- - both: Members who train at both facilities
-- =====================================================

-- Add facility column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'facility') THEN
    ALTER TABLE members ADD COLUMN facility TEXT DEFAULT 'jiujitsu';
  END IF;
END $$;

-- Add constraint for valid facility values
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_facility_check;
ALTER TABLE members ADD CONSTRAINT members_facility_check
  CHECK (facility IN ('wrestling', 'jiujitsu', 'both'));

-- Update program constraint to include all programs from both facilities
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_program_check;
ALTER TABLE members ADD CONSTRAINT members_program_check
CHECK (program IN (
  -- BJJ Programs
  'kids-bjj',
  'adult-bjj',
  'family',
  'drop-in',
  'morning-rolls',
  'all-access',
  -- Wrestling Programs
  'junior-hammers',
  'junior-hammers-annual',
  'big-hammers',
  'lady-hammers',
  'beginners',
  'family-plan',
  '2-family',
  'staff-comped'
));

-- Add index for facility filtering
CREATE INDEX IF NOT EXISTS idx_members_facility ON members(facility);

-- Add pushpress_id for migration tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'pushpress_id') THEN
    ALTER TABLE members ADD COLUMN pushpress_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_members_pushpress_id ON members(pushpress_id);

-- =====================================================
-- DONE
-- =====================================================
SELECT 'Facility field added successfully!' as status;
