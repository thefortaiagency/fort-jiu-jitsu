-- =====================================================
-- THE FORT JIU-JITSU - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- It handles existing objects gracefully (won't error)
-- =====================================================

-- =====================================================
-- 1. FIX PROGRAM CONSTRAINT (for signup to work)
-- =====================================================
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_program_check;

ALTER TABLE members ADD CONSTRAINT members_program_check
CHECK (program IN (
  'kids-bjj', 'adult-bjj', 'family', 'drop-in',
  'junior-hammers', 'big-hammers', 'lady-hammers', 'beginners'
));

-- =====================================================
-- 2. CHECK-INS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  class_id UUID,
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  checked_in_by UUID,
  check_in_method TEXT DEFAULT 'manual' CHECK (check_in_method IN ('manual', 'qr_code', 'kiosk', 'barcode', 'app')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_member ON check_ins(member_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_member_date ON check_ins(member_id, checked_in_at);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to check_ins" ON check_ins;
DROP POLICY IF EXISTS "Members can view own check_ins" ON check_ins;

CREATE POLICY "Service role full access to check_ins" ON check_ins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Members can view own check_ins" ON check_ins
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow kiosk (anon role) to create and read check-ins
DROP POLICY IF EXISTS "Allow anon insert check_ins" ON check_ins;
DROP POLICY IF EXISTS "Allow anon read check_ins" ON check_ins;

CREATE POLICY "Allow anon insert check_ins" ON check_ins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon read check_ins" ON check_ins
  FOR SELECT USING (true);

-- Allow kiosk to read members for dropdown
DROP POLICY IF EXISTS "Allow anon read members" ON members;
CREATE POLICY "Allow anon read members" ON members
  FOR SELECT USING (true);

-- =====================================================
-- 3. BELT RANKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS belt_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  gradient_start TEXT,
  gradient_end TEXT,
  sort_order INTEGER NOT NULL,
  is_kids_belt BOOLEAN DEFAULT false,
  min_age INTEGER,
  max_age INTEGER,
  typical_time_months INTEGER,
  max_stripes INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MEMBER BELT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS member_belt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  belt_rank_id UUID REFERENCES belt_ranks(id) NOT NULL,
  stripes INTEGER DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
  promoted_at TIMESTAMPTZ DEFAULT NOW(),
  promoted_by UUID REFERENCES members(id),
  notes TEXT,
  classes_attended_at_promotion INTEGER DEFAULT 0,
  days_at_previous_belt INTEGER DEFAULT 0,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ADD BELT COLUMNS TO MEMBERS
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'current_belt_id') THEN
    ALTER TABLE members ADD COLUMN current_belt_id UUID REFERENCES belt_ranks(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'current_stripes') THEN
    ALTER TABLE members ADD COLUMN current_stripes INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'belt_updated_at') THEN
    ALTER TABLE members ADD COLUMN belt_updated_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'total_classes_attended') THEN
    ALTER TABLE members ADD COLUMN total_classes_attended INTEGER DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- 6. SEED BELT RANKS DATA
-- =====================================================
-- Adult belts
INSERT INTO belt_ranks (name, display_name, color_hex, gradient_start, gradient_end, sort_order, is_kids_belt, min_age, typical_time_months, max_stripes) VALUES
  ('white', 'White Belt', '#FFFFFF', '#F8F9FA', '#FFFFFF', 1, false, 16, 12, 4),
  ('blue', 'Blue Belt', '#0066CC', '#0047AB', '#1E90FF', 2, false, 16, 24, 4),
  ('purple', 'Purple Belt', '#6B21A8', '#581C87', '#7C3AED', 3, false, 16, 24, 4),
  ('brown', 'Brown Belt', '#8B4513', '#654321', '#A0522D', 4, false, 16, 18, 4),
  ('black', 'Black Belt', '#000000', '#000000', '#1F1F1F', 5, false, 16, 0, 0)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  color_hex = EXCLUDED.color_hex;

-- Kids belts
INSERT INTO belt_ranks (name, display_name, color_hex, gradient_start, gradient_end, sort_order, is_kids_belt, min_age, max_age, typical_time_months, max_stripes) VALUES
  ('kids_white', 'White Belt', '#FFFFFF', '#F8F9FA', '#FFFFFF', 1, true, 4, 15, 6, 4),
  ('kids_grey_white', 'Grey-White Belt', '#D3D3D3', '#C0C0C0', '#E8E8E8', 2, true, 4, 15, 6, 4),
  ('kids_grey', 'Grey Belt', '#808080', '#696969', '#A9A9A9', 3, true, 4, 15, 6, 4),
  ('kids_grey_black', 'Grey-Black Belt', '#5C5C5C', '#404040', '#707070', 4, true, 4, 15, 6, 4),
  ('kids_yellow_white', 'Yellow-White Belt', '#FFEB99', '#FFE66D', '#FFF5CC', 5, true, 7, 15, 6, 4),
  ('kids_yellow', 'Yellow Belt', '#FFD700', '#FFC107', '#FFE135', 6, true, 7, 15, 6, 4),
  ('kids_yellow_black', 'Yellow-Black Belt', '#E6C200', '#CCA000', '#FFDB58', 7, true, 7, 15, 6, 4),
  ('kids_orange_white', 'Orange-White Belt', '#FFB366', '#FF9A4D', '#FFCC99', 8, true, 10, 15, 6, 4),
  ('kids_orange', 'Orange Belt', '#FF8C00', '#FF7F00', '#FFA500', 9, true, 10, 15, 6, 4),
  ('kids_orange_black', 'Orange-Black Belt', '#E67E00', '#CC6F00', '#FF9500', 10, true, 10, 15, 6, 4),
  ('kids_green_white', 'Green-White Belt', '#90EE90', '#7CCD7C', '#B0F0B0', 11, true, 13, 15, 6, 4),
  ('kids_green', 'Green Belt', '#228B22', '#32CD32', '#3CB371', 12, true, 13, 15, 6, 4),
  ('kids_green_black', 'Green-Black Belt', '#1B6B1B', '#0F5A0F', '#2E8B2E', 13, true, 13, 15, 6, 4)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  color_hex = EXCLUDED.color_hex;

-- =====================================================
-- 7. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_belt_history_member ON member_belt_history(member_id);
CREATE INDEX IF NOT EXISTS idx_belt_history_current ON member_belt_history(member_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_belt_history_promoted_at ON member_belt_history(promoted_at);
CREATE INDEX IF NOT EXISTS idx_members_current_belt ON members(current_belt_id);
CREATE INDEX IF NOT EXISTS idx_belt_ranks_sort ON belt_ranks(sort_order);

-- =====================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE belt_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_belt_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view belt ranks" ON belt_ranks;
DROP POLICY IF EXISTS "Service role full access to belt_ranks" ON belt_ranks;
DROP POLICY IF EXISTS "Service role full access to belt_history" ON member_belt_history;
DROP POLICY IF EXISTS "Members can view own belt history" ON member_belt_history;

CREATE POLICY "Anyone can view belt ranks" ON belt_ranks
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to belt_ranks" ON belt_ranks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to belt_history" ON member_belt_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Members can view own belt history" ON member_belt_history
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

-- =====================================================
-- 9. FUNCTIONS & TRIGGERS
-- =====================================================

-- Update member's current belt when history is added
CREATE OR REPLACE FUNCTION update_member_current_belt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE member_belt_history
  SET is_current = false
  WHERE member_id = NEW.member_id AND id != NEW.id;

  UPDATE members
  SET
    current_belt_id = NEW.belt_rank_id,
    current_stripes = NEW.stripes,
    belt_updated_at = NEW.promoted_at,
    updated_at = NOW()
  WHERE id = NEW.member_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_belt ON member_belt_history;
CREATE TRIGGER trigger_update_member_belt
  AFTER INSERT ON member_belt_history
  FOR EACH ROW
  EXECUTE FUNCTION update_member_current_belt();

-- Increment classes when check-in is created
CREATE OR REPLACE FUNCTION increment_classes_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE members
  SET total_classes_attended = COALESCE(total_classes_attended, 0) + 1,
      updated_at = NOW()
  WHERE id = NEW.member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_classes ON check_ins;
CREATE TRIGGER trigger_increment_classes
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION increment_classes_on_checkin();

-- =====================================================
-- 10. BELT STATISTICS VIEW
-- =====================================================
CREATE OR REPLACE VIEW belt_statistics AS
SELECT
  br.display_name AS belt_name,
  br.color_hex,
  br.is_kids_belt,
  COUNT(m.id) AS member_count,
  AVG(m.current_stripes) AS avg_stripes,
  AVG(EXTRACT(DAY FROM NOW() - m.belt_updated_at)) AS avg_days_at_belt
FROM belt_ranks br
LEFT JOIN members m ON br.id = m.current_belt_id AND m.status = 'active'
GROUP BY br.id, br.display_name, br.color_hex, br.is_kids_belt, br.sort_order
ORDER BY br.is_kids_belt, br.sort_order;

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'Setup complete! All tables created.' as status;
