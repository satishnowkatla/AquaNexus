-- =============================================
-- 009: Create Indexes for Performance
-- =============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Ponds
CREATE INDEX IF NOT EXISTS idx_ponds_farmer_id ON ponds(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ponds_status ON ponds(status);

-- Disease Reports
CREATE INDEX IF NOT EXISTS idx_disease_farmer_id ON disease_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_pond_id ON disease_reports(pond_id);
CREATE INDEX IF NOT EXISTS idx_disease_created ON disease_reports(created_at DESC);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pond_id ON transactions(pond_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);

-- Chat Messages
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at DESC);

-- Feed Schedules
CREATE INDEX IF NOT EXISTS idx_feed_pond_id ON feed_schedules(pond_id);

-- Feed Logs
CREATE INDEX IF NOT EXISTS idx_feed_logs_schedule_id ON feed_logs(schedule_id);

-- Cooperative Members
CREATE INDEX IF NOT EXISTS idx_coop_members_coop_id ON cooperative_members(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_coop_members_user_id ON cooperative_members(user_id);

-- Cooperative Alerts
CREATE INDEX IF NOT EXISTS idx_coop_alerts_coop_id ON cooperative_alerts(cooperative_id);
