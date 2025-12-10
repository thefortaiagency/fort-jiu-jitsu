-- Fix program constraint to match application code
-- The current constraint only allows: 'junior-hammers', 'big-hammers', 'lady-hammers', 'beginners'
-- The application uses: 'kids-bjj', 'adult-bjj', 'family', 'drop-in'

-- Drop the old constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_program_check;

-- Add new constraint with updated values that match the application
ALTER TABLE members ADD CONSTRAINT members_program_check
CHECK (program IN (
  'kids-bjj',      -- Kids BJJ program
  'adult-bjj',     -- Adult BJJ program
  'family',        -- Family membership
  'drop-in',       -- Drop-in class
  'junior-hammers', -- Legacy value (keep for backward compatibility)
  'big-hammers',    -- Legacy value (keep for backward compatibility)
  'lady-hammers',   -- Legacy value (keep for backward compatibility)
  'beginners'       -- Legacy value (keep for backward compatibility)
));

-- Update existing members to new program values if needed
-- UPDATE members SET program = 'adult-bjj' WHERE program = 'big-hammers';
-- UPDATE members SET program = 'kids-bjj' WHERE program IN ('junior-hammers', 'beginners');
-- UPDATE members SET program = 'adult-bjj' WHERE program = 'lady-hammers';

COMMENT ON CONSTRAINT members_program_check ON members IS 'Allowed program values: kids-bjj, adult-bjj, family, drop-in (plus legacy values)';
