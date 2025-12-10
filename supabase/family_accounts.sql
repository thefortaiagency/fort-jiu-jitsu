-- Family Account System for The Fort Jiu-Jitsu
-- This migration adds comprehensive family account functionality

-- Add family account fields to members table if not exists
DO $$
BEGIN
    -- Add family_account_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'family_account_id'
    ) THEN
        ALTER TABLE members ADD COLUMN family_account_id UUID REFERENCES members(id) ON DELETE SET NULL;
    END IF;

    -- Add is_primary_account_holder if not exists (default false)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'is_primary_account_holder'
    ) THEN
        ALTER TABLE members ADD COLUMN is_primary_account_holder BOOLEAN DEFAULT false;
    END IF;

    -- Add family_role for categorization
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'family_role'
    ) THEN
        ALTER TABLE members ADD COLUMN family_role TEXT CHECK (family_role IN ('primary', 'spouse', 'child', 'other'));
    END IF;

    -- Add relationship_to_primary for context
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'relationship_to_primary'
    ) THEN
        ALTER TABLE members ADD COLUMN relationship_to_primary TEXT;
    END IF;

    -- Add individual_monthly_cost if not exists (for tracking individual vs family pricing)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'individual_monthly_cost'
    ) THEN
        ALTER TABLE members ADD COLUMN individual_monthly_cost DECIMAL(10,2) DEFAULT 100.00;
    END IF;
END $$;

-- Create family_accounts table for aggregate family data
CREATE TABLE IF NOT EXISTS family_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    family_name TEXT,
    total_members INTEGER DEFAULT 1,
    monthly_rate DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(primary_member_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_members_family_account ON members(family_account_id) WHERE family_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_primary_account_holder ON members(is_primary_account_holder) WHERE is_primary_account_holder = true;
CREATE INDEX IF NOT EXISTS idx_family_accounts_primary_member ON family_accounts(primary_member_id);
CREATE INDEX IF NOT EXISTS idx_family_accounts_active ON family_accounts(is_active) WHERE is_active = true;

-- Create updated_at trigger for family_accounts
CREATE OR REPLACE FUNCTION update_family_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS family_accounts_updated_at ON family_accounts;
CREATE TRIGGER family_accounts_updated_at
    BEFORE UPDATE ON family_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_family_accounts_updated_at();

-- Function to calculate family pricing
-- Pricing logic:
-- - 1 member: Individual rate ($75 kid, $100 adult)
-- - 2 members: $150 flat family rate
-- - 3+ members: $150 base + $50 per additional member (25% discount)
CREATE OR REPLACE FUNCTION calculate_family_pricing(
    p_family_account_id UUID,
    OUT monthly_total DECIMAL(10,2),
    OUT base_rate DECIMAL(10,2),
    OUT additional_member_rate DECIMAL(10,2),
    OUT total_savings DECIMAL(10,2),
    OUT member_count INTEGER
)
RETURNS RECORD AS $$
DECLARE
    v_individual_total DECIMAL(10,2);
    v_family_total DECIMAL(10,2);
BEGIN
    -- Get all family members and their individual costs
    SELECT
        COUNT(*),
        SUM(individual_monthly_cost)
    INTO
        member_count,
        v_individual_total
    FROM members
    WHERE family_account_id = p_family_account_id
       OR (is_primary_account_holder = true AND id = p_family_account_id);

    -- Calculate family pricing
    IF member_count <= 1 THEN
        -- Single member: use individual rate
        v_family_total := COALESCE(v_individual_total, 100.00);
        base_rate := v_family_total;
        additional_member_rate := 0;
    ELSIF member_count = 2 THEN
        -- Two members: $150 flat family rate
        v_family_total := 150.00;
        base_rate := 150.00;
        additional_member_rate := 0;
    ELSE
        -- 3+ members: $150 base + $50 per additional member (25% discount from $66.67 average)
        base_rate := 150.00;
        additional_member_rate := 50.00;
        v_family_total := base_rate + (additional_member_rate * (member_count - 2));
    END IF;

    monthly_total := v_family_total;
    total_savings := GREATEST(0, v_individual_total - v_family_total);
END;
$$ LANGUAGE plpgsql;

-- Function to sync family account totals
CREATE OR REPLACE FUNCTION sync_family_account_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_primary_id UUID;
    v_pricing RECORD;
BEGIN
    -- Determine the primary account holder ID
    IF TG_OP = 'DELETE' THEN
        v_primary_id := OLD.family_account_id;
    ELSE
        IF NEW.is_primary_account_holder THEN
            v_primary_id := NEW.id;
        ELSE
            v_primary_id := NEW.family_account_id;
        END IF;
    END IF;

    -- Skip if no family account
    IF v_primary_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Calculate new pricing
    SELECT * INTO v_pricing FROM calculate_family_pricing(v_primary_id);

    -- Update or insert family_accounts record
    INSERT INTO family_accounts (
        primary_member_id,
        family_name,
        total_members,
        monthly_rate,
        discount_percentage,
        updated_at
    )
    SELECT
        v_primary_id,
        m.first_name || ' ' || m.last_name || ' Family',
        v_pricing.member_count,
        v_pricing.monthly_total,
        CASE
            WHEN v_pricing.member_count >= 3 THEN 25.00
            ELSE 0
        END,
        NOW()
    FROM members m
    WHERE m.id = v_primary_id
    ON CONFLICT (primary_member_id)
    DO UPDATE SET
        total_members = EXCLUDED.total_members,
        monthly_rate = EXCLUDED.monthly_rate,
        discount_percentage = EXCLUDED.discount_percentage,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically sync family account totals
DROP TRIGGER IF EXISTS sync_family_on_member_insert ON members;
CREATE TRIGGER sync_family_on_member_insert
    AFTER INSERT ON members
    FOR EACH ROW
    WHEN (NEW.family_account_id IS NOT NULL OR NEW.is_primary_account_holder = true)
    EXECUTE FUNCTION sync_family_account_totals();

DROP TRIGGER IF EXISTS sync_family_on_member_update ON members;
CREATE TRIGGER sync_family_on_member_update
    AFTER UPDATE ON members
    FOR EACH ROW
    WHEN (NEW.family_account_id IS NOT NULL OR NEW.is_primary_account_holder = true OR
          OLD.family_account_id IS DISTINCT FROM NEW.family_account_id)
    EXECUTE FUNCTION sync_family_account_totals();

DROP TRIGGER IF EXISTS sync_family_on_member_delete ON members;
CREATE TRIGGER sync_family_on_member_delete
    AFTER DELETE ON members
    FOR EACH ROW
    WHEN (OLD.family_account_id IS NOT NULL)
    EXECUTE FUNCTION sync_family_account_totals();

-- Helpful views for family account management

-- View: Family account summary with all members
CREATE OR REPLACE VIEW family_account_summary AS
SELECT
    fa.id AS family_account_id,
    fa.primary_member_id,
    fa.family_name,
    fa.total_members,
    fa.monthly_rate,
    fa.discount_percentage,
    fa.stripe_subscription_id,
    fa.is_active,
    pm.first_name AS primary_first_name,
    pm.last_name AS primary_last_name,
    pm.email AS primary_email,
    pm.stripe_customer_id,
    json_agg(
        json_build_object(
            'id', m.id,
            'first_name', m.first_name,
            'last_name', m.last_name,
            'email', m.email,
            'program', m.program,
            'family_role', m.family_role,
            'relationship_to_primary', m.relationship_to_primary,
            'individual_monthly_cost', m.individual_monthly_cost,
            'is_primary', m.is_primary_account_holder
        ) ORDER BY m.is_primary_account_holder DESC, m.created_at
    ) AS members,
    fa.created_at,
    fa.updated_at
FROM family_accounts fa
INNER JOIN members pm ON pm.id = fa.primary_member_id
LEFT JOIN members m ON m.family_account_id = fa.primary_member_id OR m.id = fa.primary_member_id
GROUP BY
    fa.id, fa.primary_member_id, fa.family_name, fa.total_members,
    fa.monthly_rate, fa.discount_percentage, fa.stripe_subscription_id,
    fa.is_active, pm.first_name, pm.last_name, pm.email,
    pm.stripe_customer_id, fa.created_at, fa.updated_at;

-- View: Individual member family details
CREATE OR REPLACE VIEW member_family_details AS
SELECT
    m.id AS member_id,
    m.first_name,
    m.last_name,
    m.email,
    m.is_primary_account_holder,
    m.family_account_id,
    m.family_role,
    m.relationship_to_primary,
    m.individual_monthly_cost,
    fa.family_name,
    fa.total_members,
    fa.monthly_rate AS family_monthly_rate,
    fa.discount_percentage,
    pm.first_name AS primary_first_name,
    pm.last_name AS primary_last_name,
    pm.email AS primary_email
FROM members m
LEFT JOIN family_accounts fa ON
    (m.is_primary_account_holder AND m.id = fa.primary_member_id) OR
    (NOT m.is_primary_account_holder AND m.family_account_id = fa.primary_member_id)
LEFT JOIN members pm ON pm.id = fa.primary_member_id;

-- Grant permissions (adjust as needed for your RLS policies)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON family_accounts TO authenticated;
-- GRANT SELECT ON family_account_summary TO authenticated;
-- GRANT SELECT ON member_family_details TO authenticated;

COMMENT ON TABLE family_accounts IS 'Aggregate table tracking family account information and pricing';
COMMENT ON COLUMN family_accounts.monthly_rate IS 'Calculated monthly rate based on family size: $150 for 2, $150 + $50 per additional for 3+';
COMMENT ON COLUMN family_accounts.discount_percentage IS '25% discount applies for families with 3+ members';
COMMENT ON FUNCTION calculate_family_pricing IS 'Calculates family pricing: 1=$individual, 2=$150, 3+=$150+$50/member';
COMMENT ON VIEW family_account_summary IS 'Complete family account information with all members aggregated';
COMMENT ON VIEW member_family_details IS 'Individual member view with their family account context';
