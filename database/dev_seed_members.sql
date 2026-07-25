-- =============================================
-- DEV: Seed AquaConnect Cooperative Members
-- Run in Supabase SQL Editor
-- =============================================

-- Insert realistic Krishna Delta fish farmer members
INSERT INTO users (id, phone, full_name, role, language, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111101', '+919848123456', 'Ramanayya Goud', 'farmer', 'te', NOW() - INTERVAL '60 days'),
  ('11111111-1111-1111-1111-111111111102', '+919849234567', 'Srinivasa Rao', 'farmer', 'te', NOW() - INTERVAL '55 days'),
  ('11111111-1111-1111-1111-111111111103', '+919701345678', 'Murali Krishna', 'cooperative', 'te', NOW() - INTERVAL '50 days'),
  ('11111111-1111-1111-1111-111111111104', '+919989456789', 'Venkateswarlu', 'farmer', 'te', NOW() - INTERVAL '45 days'),
  ('11111111-1111-1111-1111-111111111105', '+918500567890', 'Lakshmi Devi', 'farmer', 'te', NOW() - INTERVAL '40 days'),
  ('11111111-1111-1111-1111-111111111106', '+919496678901', 'Rajesh Kumar', 'farmer', 'hi', NOW() - INTERVAL '35 days'),
  ('11111111-1111-1111-1111-111111111107', '+917989789012', 'Prasad Reddy', 'farmer', 'te', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111108', '+919390890123', 'Sunitha Rani', 'farmer', 'te', NOW() - INTERVAL '25 days')
ON CONFLICT (phone) DO NOTHING;

-- Insert profiles for each member
INSERT INTO profiles (user_id, district, village, total_pond_area, primary_species, years_experience)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Krishna', 'Vuyyuru', 3.5, 'shrimp', 12),
  ('11111111-1111-1111-1111-111111111102', 'Krishna', 'Gudivada', 5.0, 'shrimp', 8),
  ('11111111-1111-1111-1111-111111111103', 'Krishna', 'Machilipatnam', 8.0, 'shrimp', 15),
  ('11111111-1111-1111-1111-111111111104', 'West Godavari', 'Eluru', 4.2, 'fish', 10),
  ('11111111-1111-1111-1111-111111111105', 'Krishna', 'Nandigama', 2.8, 'prawn', 6),
  ('11111111-1111-1111-1111-111111111106', 'Guntur', 'Tenali', 6.0, 'shrimp', 9),
  ('11111111-1111-1111-1111-111111111107', 'Krishna', 'Vijayawada', 3.0, 'fish', 7),
  ('11111111-1111-1111-1111-111111111108', 'East Godavari', 'Kakinada', 2.5, 'prawn', 5);

-- Add all members to the cooperative
INSERT INTO cooperative_members (cooperative_id, user_id)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id FROM users WHERE id LIKE '11111111-1111-1111-1111-1111111111%';

-- Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON profiles TO anon;
GRANT ALL ON cooperative_members TO anon;
