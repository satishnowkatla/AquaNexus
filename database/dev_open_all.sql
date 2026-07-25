-- DEV: Open ALL tables for development (anonymous auth)
-- Run this entire script in Supabase SQL Editor

-- Disable RLS on ALL tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ponds DISABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooperatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_alerts DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON ponds TO anon;
GRANT ALL ON ponds TO authenticated;
GRANT ALL ON disease_reports TO anon;
GRANT ALL ON disease_reports TO authenticated;
GRANT ALL ON transactions TO anon;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON chat_messages TO anon;
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON feed_schedules TO anon;
GRANT ALL ON feed_schedules TO authenticated;
GRANT ALL ON feed_logs TO anon;
GRANT ALL ON feed_logs TO authenticated;
GRANT ALL ON cooperatives TO anon;
GRANT ALL ON cooperatives TO authenticated;
GRANT ALL ON cooperative_members TO anon;
GRANT ALL ON cooperative_members TO authenticated;
GRANT ALL ON cooperative_alerts TO anon;
GRANT ALL ON cooperative_alerts TO authenticated;
