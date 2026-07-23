import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Client for user operations (uses anon key)
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Admin client for server operations (uses service key)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);
