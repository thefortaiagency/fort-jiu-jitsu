-- BJJ Belt Progression System - SAFE version that handles existing objects
-- Run this if you got errors from the original belt_progression.sql

-- Belt ranks table
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

-- Member belt history
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

-- Add columns to members table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'current_belt_id') THEN
    ALTER TABLE members ADD COLUMN current_belt_id UUID REFERENCES belt_ranks(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'members' AND column_name = 'current_stripes') THEN
    ALTER TABLE members ADD COLUMN current_stripes INTEGER DEFAULT 0 CHECK (current_stripes >= 0 AND current_stripes <= 4);
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

-- Seed adult belt ranks
INSERT INTO belt_ranks (name, display_name, color_hex, gradient_start, gradient_end, sort_order, is_kids_belt, min_age, typical_time_months, max_stripes) VALUES
  ('white', 'White Belt', '#FFFFFF', '#F8F9FA', '#FFFFFF', 1, false, 16, 12, 4),
  ('blue', 'Blue Belt', '#0066CC', '#0047AB', '#1E90FF', 2, false, 16, 24, 4),
  ('purple', 'Purple Belt', '#6B21A8', '#581C87', '#7C3AED', 3, false, 16, 24, 4),
  ('brown', 'Brown Belt', '#8B4513', '#654321', '#A0522D', 4, false, 16, 18, 4),
  ('black', 'Black Belt', '#000000', '#000000', '#1F1F1F', 5, false, 16, 0, 0)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  color_hex = EXCLUDED.color_hex,
  gradient_start = EXCLUDED.gradient_start,
  gradient_end = EXCLUDED.gradient_end;

-- Seed kids belt ranks
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
  color_hex = EXCLUDED.color_hex,
  gradient_start = EXCLUDED.gradient_start,
  gradient_end = EXCLUDED.gradient_end;

-- Create indexes (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_belt_history_member ON member_belt_history(member_id);
CREATE INDEX IF NOT EXISTS idx_belt_history_current ON member_belt_history(member_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_belt_history_promoted_at ON member_belt_history(promoted_at);
CREATE INDEX IF NOT EXISTS idx_members_current_belt ON members(current_belt_id);
CREATE INDEX IF NOT EXISTS idx_belt_ranks_sort ON belt_ranks(sort_order);

-- Enable RLS
ALTER TABLE belt_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_belt_history ENABLE ROW LEVEL SECURITY;

-- DROP existing policies first to avoid conflicts, then recreate
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

-- Function to update member's current belt
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

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_member_belt ON member_belt_history;
CREATE TRIGGER trigger_update_member_belt
  AFTER INSERT ON member_belt_history
  FOR EACH ROW
  EXECUTE FUNCTION update_member_current_belt();

-- Function for promotion eligibility
CREATE OR REPLACE FUNCTION get_promotion_eligibility(
  p_member_id UUID,
  p_min_days INTEGER DEFAULT 180,
  p_min_classes INTEGER DEFAULT 50
)
RETURNS TABLE (
  member_id UUID,
  is_eligible BOOLEAN,
  days_at_current_belt INTEGER,
  classes_since_promotion INTEGER,
  current_belt_name TEXT,
  next_belt_name TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS member_id,
    CASE
      WHEN mbh.promoted_at IS NULL THEN false
      WHEN EXTRACT(DAY FROM NOW() - mbh.promoted_at) >= p_min_days
           AND (m.total_classes_attended - COALESCE(mbh.classes_attended_at_promotion, 0)) >= p_min_classes
      THEN true
      ELSE false
    END AS is_eligible,
    COALESCE(EXTRACT(DAY FROM NOW() - mbh.promoted_at)::INTEGER, 0) AS days_at_current_belt,
    m.total_classes_attended - COALESCE(mbh.classes_attended_at_promotion, 0) AS classes_since_promotion,
    br.display_name AS current_belt_name,
    next_br.display_name AS next_belt_name,
    CASE
      WHEN EXTRACT(DAY FROM NOW() - mbh.promoted_at) < p_min_days THEN
        'Need ' || (p_min_days - EXTRACT(DAY FROM NOW() - mbh.promoted_at))::TEXT || ' more days'
      WHEN (m.total_classes_attended - COALESCE(mbh.classes_attended_at_promotion, 0)) < p_min_classes THEN
        'Need ' || (p_min_classes - (m.total_classes_attended - COALESCE(mbh.classes_attended_at_promotion, 0)))::TEXT || ' more classes'
      ELSE 'Ready for promotion'
    END AS recommendation
  FROM members m
  LEFT JOIN member_belt_history mbh ON m.id = mbh.member_id AND mbh.is_current = true
  LEFT JOIN belt_ranks br ON m.current_belt_id = br.id
  LEFT JOIN belt_ranks next_br ON next_br.sort_order = br.sort_order + 1
                               AND next_br.is_kids_belt = br.is_kids_belt
  WHERE m.id = p_member_id;
END;
$$ LANGUAGE plpgsql;

-- View for belt statistics
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

-- Done!
SELECT 'Belt progression system setup complete!' as message;
