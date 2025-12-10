-- Check-ins Table for The Fort Jiu-Jitsu
-- Tracks member attendance at classes

CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  class_id UUID, -- optional reference to specific class
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  checked_in_by UUID, -- staff member who checked them in (if applicable)
  check_in_method TEXT DEFAULT 'manual' CHECK (check_in_method IN ('manual', 'qr_code', 'kiosk', 'app')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_check_ins_member ON check_ins(member_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_member_date ON check_ins(member_id, checked_in_at);

-- Enable RLS
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Service role full access to check_ins" ON check_ins;
DROP POLICY IF EXISTS "Members can view own check_ins" ON check_ins;

-- Service role can do everything
CREATE POLICY "Service role full access to check_ins" ON check_ins
  FOR ALL USING (auth.role() = 'service_role');

-- Members can view their own check-ins
CREATE POLICY "Members can view own check_ins" ON check_ins
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

-- Function to increment total_classes_attended when check-in is created
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

-- Trigger
DROP TRIGGER IF EXISTS trigger_increment_classes ON check_ins;
CREATE TRIGGER trigger_increment_classes
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION increment_classes_on_checkin();

COMMENT ON TABLE check_ins IS 'Tracks member attendance/check-ins at classes';
