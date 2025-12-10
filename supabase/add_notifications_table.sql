-- Add notifications table for The Fort Jiu-Jitsu
-- Run this in Supabase SQL Editor: https://qpyjujdwdkyvdmhpsyul.supabase.co

-- Create notifications table to track waiver expiration and other member alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,

  -- Notification details
  type VARCHAR(50) NOT NULL, -- 'waiver_expiring', 'waiver_expired', 'turned_18', 'payment_failed', 'membership_ending'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,

  -- Priority and status
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  read BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,

  -- Action links
  action_url VARCHAR(500), -- Link to take action (e.g., /signup/waiver)
  action_label VARCHAR(100), -- Button text (e.g., "Renew Waiver")

  -- Email tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  -- Related data
  related_id UUID, -- ID of related entity (waiver_id, payment_id, etc.)
  metadata JSONB, -- Additional context data

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE, -- When notification is no longer relevant

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_member_unread ON notifications(member_id, read) WHERE read = FALSE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access to notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Members can view their own notifications
CREATE POLICY "Members can view own notifications" ON notifications
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

-- Members can update their own notifications (mark as read/dismissed)
CREATE POLICY "Members can update own notifications" ON notifications
  FOR UPDATE USING (
    member_id IN (
      SELECT id FROM members WHERE email = auth.jwt()->>'email'
    )
  );

COMMENT ON TABLE notifications IS 'Stores notifications for The Fort Jiu-Jitsu members (waiver expiration, payments, etc)';

-- Create helper function to create waiver expiration notifications
CREATE OR REPLACE FUNCTION create_waiver_expiration_notification(
  p_member_id UUID,
  p_waiver_id UUID,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_days_until_expiration INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_type VARCHAR(50);
  v_title VARCHAR(200);
  v_message TEXT;
  v_priority VARCHAR(20);
BEGIN
  -- Determine notification type and priority based on days until expiration
  IF p_days_until_expiration < 0 THEN
    v_type := 'waiver_expired';
    v_title := 'Waiver Expired';
    v_message := 'Your liability waiver has expired. You must sign a new waiver before your next class.';
    v_priority := 'urgent';
  ELSIF p_days_until_expiration <= 7 THEN
    v_type := 'waiver_expiring';
    v_title := 'Waiver Expiring Soon';
    v_message := 'Your liability waiver expires in ' || p_days_until_expiration || ' days. Please renew it to avoid interruption.';
    v_priority := 'high';
  ELSIF p_days_until_expiration <= 30 THEN
    v_type := 'waiver_expiring';
    v_title := 'Waiver Expiring This Month';
    v_message := 'Your liability waiver expires in ' || p_days_until_expiration || ' days. You can renew it now.';
    v_priority := 'normal';
  ELSE
    -- Don't create notification if more than 30 days away
    RETURN NULL;
  END IF;

  -- Check if notification already exists (to avoid duplicates)
  SELECT id INTO v_notification_id
  FROM notifications
  WHERE member_id = p_member_id
    AND type IN ('waiver_expiring', 'waiver_expired')
    AND dismissed = FALSE
  LIMIT 1;

  IF v_notification_id IS NOT NULL THEN
    -- Update existing notification
    UPDATE notifications
    SET
      title = v_title,
      message = v_message,
      priority = v_priority,
      related_id = p_waiver_id,
      metadata = jsonb_build_object(
        'days_until_expiration', p_days_until_expiration,
        'expires_at', p_expires_at
      ),
      updated_at = NOW()
    WHERE id = v_notification_id;

    RETURN v_notification_id;
  ELSE
    -- Create new notification
    INSERT INTO notifications (
      member_id,
      type,
      title,
      message,
      priority,
      action_url,
      action_label,
      related_id,
      metadata,
      expires_at
    ) VALUES (
      p_member_id,
      v_type,
      v_title,
      v_message,
      v_priority,
      '/signup?renew=true',
      'Renew Waiver',
      p_waiver_id,
      jsonb_build_object(
        'days_until_expiration', p_days_until_expiration,
        'expires_at', p_expires_at
      ),
      p_expires_at + INTERVAL '30 days' -- Notification expires 30 days after waiver expiration
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create helper function to create "turned 18" notifications
CREATE OR REPLACE FUNCTION create_turned_adult_notification(
  p_member_id UUID,
  p_old_waiver_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Check if notification already exists
  SELECT id INTO v_notification_id
  FROM notifications
  WHERE member_id = p_member_id
    AND type = 'turned_18'
    AND dismissed = FALSE
  LIMIT 1;

  IF v_notification_id IS NOT NULL THEN
    RETURN v_notification_id;
  END IF;

  -- Create new notification
  INSERT INTO notifications (
    member_id,
    type,
    title,
    message,
    priority,
    action_url,
    action_label,
    related_id,
    metadata
  ) VALUES (
    p_member_id,
    'turned_18',
    'You Need to Sign Your Own Waiver',
    'You''ve turned 18! You now need to sign your own liability waiver (not your parent/guardian).',
    'high',
    '/signup?adult_waiver=true',
    'Sign Adult Waiver',
    p_old_waiver_id,
    jsonb_build_object('reason', 'turned_18')
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_waiver_expiration_notification IS 'Creates or updates a waiver expiration notification for a member';
COMMENT ON FUNCTION create_turned_adult_notification IS 'Creates a notification when a member turns 18 and needs to sign their own waiver';
