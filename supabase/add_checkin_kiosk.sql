-- =====================================================
-- CHECK-IN KIOSK SETUP
-- Run this in Supabase SQL Editor to enable the check-in kiosk
-- =====================================================

-- 1. CREATE CHECK-INS TABLE
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

-- 2. ADD INDEXES
CREATE INDEX IF NOT EXISTS idx_check_ins_member ON check_ins(member_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_member_date ON check_ins(member_id, checked_in_at);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES (idempotent)
DROP POLICY IF EXISTS "Service role full access to check_ins" ON check_ins;
DROP POLICY IF EXISTS "Members can view own check_ins" ON check_ins;
DROP POLICY IF EXISTS "Allow anon insert check_ins" ON check_ins;
DROP POLICY IF EXISTS "Allow anon read check_ins" ON check_ins;

-- 5. CREATE POLICIES
-- Service role has full access
CREATE POLICY "Service role full access to check_ins" ON check_ins
  FOR ALL USING (auth.role() = 'service_role');

-- Members can view their own check-ins
CREATE POLICY "Members can view own check_ins" ON check_ins
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

-- Kiosk (anon role) can create check-ins
CREATE POLICY "Allow anon insert check_ins" ON check_ins
  FOR INSERT WITH CHECK (true);

-- Kiosk can read check-ins for today's list
CREATE POLICY "Allow anon read check_ins" ON check_ins
  FOR SELECT USING (true);

-- 6. ALLOW KIOSK TO READ MEMBERS
DROP POLICY IF EXISTS "Allow anon read members" ON members;
CREATE POLICY "Allow anon read members" ON members
  FOR SELECT USING (true);

-- 7. INCREMENT CLASSES COUNTER ON CHECK-IN
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

-- DONE!
SELECT 'Check-in kiosk setup complete! Members can now check in.' as status;
