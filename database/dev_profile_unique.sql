-- One profile per user (fixes ON CONFLICT errors)
-- Run in Supabase SQL Editor

-- Remove duplicate rows first (keep the earliest) so the unique index can be created
DELETE FROM profiles a
USING profiles b
WHERE a.user_id = b.user_id
  AND a.id > b.id;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;
