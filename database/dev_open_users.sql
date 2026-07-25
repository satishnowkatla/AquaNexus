-- DEV: Allow anon users to insert into users table (for cooperative join)
-- Run this in Supabase SQL Editor

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
