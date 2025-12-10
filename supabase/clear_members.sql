-- Clear all member-related data for fresh start
-- Run this in Supabase SQL Editor

-- First, delete related records (due to foreign key constraints)
DELETE FROM check_ins;
DELETE FROM waivers;
DELETE FROM notifications;

-- Now delete all members
DELETE FROM members;

-- Verify tables are empty
SELECT 'members' as table_name, COUNT(*) as count FROM members
UNION ALL
SELECT 'check_ins', COUNT(*) FROM check_ins
UNION ALL
SELECT 'waivers', COUNT(*) FROM waivers
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
