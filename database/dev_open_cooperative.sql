-- =============================================
-- DEV: Open cooperative tables for AquaConnect
-- =============================================
-- Run this against Supabase SQL Editor (same as feed_schedules)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Members can view cooperative" ON cooperatives;
DROP POLICY IF EXISTS "Members can view members list" ON cooperative_members;
DROP POLICY IF EXISTS "Members can view alerts" ON cooperative_alerts;

-- Disable RLS for development
ALTER TABLE cooperatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_alerts DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON cooperatives TO anon;
GRANT ALL ON cooperatives TO authenticated;
GRANT ALL ON cooperative_members TO anon;
GRANT ALL ON cooperative_members TO authenticated;
GRANT ALL ON cooperative_alerts TO anon;
GRANT ALL ON cooperative_alerts TO authenticated;

-- =============================================
-- SEED: Test data for AquaConnect
-- =============================================

-- Create a test cooperative (skip if exists)
INSERT INTO cooperatives (id, name, district, member_count)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Krishna Delta Fish Farmers', 'Krishna', 6
WHERE NOT EXISTS (SELECT 1 FROM cooperatives WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- Create 6 test members
INSERT INTO cooperative_members (cooperative_id, user_id, joined_at)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  NOW() - INTERVAL '6 months'
FROM users
WHERE phone = '8328057237'
  AND NOT EXISTS (
    SELECT 1 FROM cooperative_members
    WHERE cooperative_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    AND user_id = users.id
  );

-- Create test alerts
INSERT INTO cooperative_alerts (cooperative_id, title, message, alert_type, priority)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'New subsidy announced',
  'Central government announced 30% subsidy on pond construction for aquaculture farmers in Andhra Pradesh.',
  'info',
  'medium'
WHERE NOT EXISTS (
  SELECT 1 FROM cooperative_alerts WHERE title = 'New subsidy announced'
);

INSERT INTO cooperative_alerts (cooperative_id, title, message, alert_type, priority)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Water quality alert: pH dropping',
  'Multiple farms in Krishna district reported pH levels below 6.5. Check water immediately.',
  'warning',
  'high'
WHERE NOT EXISTS (
  SELECT 1 FROM cooperative_alerts WHERE title = 'Water quality alert: pH dropping'
);

INSERT INTO cooperative_alerts (cooperative_id, title, message, alert_type, priority)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Training session: Organic farming',
  'Free training on organic aquaculture this Saturday at Machilipatnam. Register via AquaConnect.',
  'info',
  'low'
WHERE NOT EXISTS (
  SELECT 1 FROM cooperative_alerts WHERE title = 'Training session: Organic farming'
);
