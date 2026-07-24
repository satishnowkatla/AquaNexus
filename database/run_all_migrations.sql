-- Drop existing policies first, then recreate everything
DO $$ BEGIN
  -- Users policies
  DROP POLICY IF EXISTS "Users can view own profile" ON users;
  DROP POLICY IF EXISTS "Users can update own profile" ON users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 001: Users (skip if exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('farmer','cooperative')) DEFAULT 'farmer',
    language VARCHAR(10) CHECK (language IN ('te','hi','en')) DEFAULT 'te',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 002: Profiles
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    district VARCHAR(100),
    village VARCHAR(100),
    pincode VARCHAR(6),
    total_pond_area DECIMAL(10,2),
    primary_species VARCHAR(50),
    years_experience INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 003: Ponds
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can view own ponds" ON ponds;
  DROP POLICY IF EXISTS "Farmers can insert own ponds" ON ponds;
  DROP POLICY IF EXISTS "Farmers can update own ponds" ON ponds;
  DROP POLICY IF EXISTS "Farmers can delete own ponds" ON ponds;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS ponds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    area_acres DECIMAL(6,2) NOT NULL,
    species VARCHAR(50) NOT NULL,
    stocking_density INT,
    stocking_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(20) CHECK (status IN ('active','harvested','inactive')) DEFAULT 'active',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ponds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view own ponds" ON ponds FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own ponds" ON ponds FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own ponds" ON ponds FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own ponds" ON ponds FOR DELETE USING (auth.uid() = farmer_id);

-- 004: Disease Reports
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can view own reports" ON disease_reports;
  DROP POLICY IF EXISTS "Farmers can insert own reports" ON disease_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id),
    pond_id UUID REFERENCES ponds(id),
    image_url TEXT,
    voice_description TEXT,
    symptoms TEXT[],
    diagnosis TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low','medium','high','critical')),
    treatment TEXT,
    medicine_name VARCHAR(200),
    medicine_dosage TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view own reports" ON disease_reports FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own reports" ON disease_reports FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- 005: Transactions
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can view own transactions" ON transactions;
  DROP POLICY IF EXISTS "Farmers can insert own transactions" ON transactions;
  DROP POLICY IF EXISTS "Farmers can delete own transactions" ON transactions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id),
    pond_id UUID REFERENCES ponds(id),
    type VARCHAR(20) CHECK (type IN ('income','expense')) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    voice_text TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view own transactions" ON transactions FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = farmer_id);

-- 006: Chat Messages
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own chats" ON chat_messages;
  DROP POLICY IF EXISTS "Users can insert own chats" ON chat_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    module VARCHAR(50) DEFAULT 'advisor',
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'te',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chats" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 007: Feed Schedules & Logs
DO $$ BEGIN
  DROP POLICY IF EXISTS "Farmers can view own feed schedules" ON feed_schedules;
  DROP POLICY IF EXISTS "Farmers can insert own feed schedules" ON feed_schedules;
  DROP POLICY IF EXISTS "Farmers can view own feed logs" ON feed_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS feed_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pond_id UUID REFERENCES ponds(id),
    feed_type VARCHAR(50),
    morning_kg DECIMAL(8,2),
    evening_kg DECIMAL(8,2),
    total_daily_kg DECIMAL(8,2),
    feed_grade VARCHAR(20),
    cumulative_cost DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS feed_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES feed_schedules(id),
    feed_date DATE NOT NULL,
    quantity_kg DECIMAL(8,2),
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feed_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view own feed schedules" ON feed_schedules FOR SELECT USING (
    EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feed_schedules.pond_id AND ponds.farmer_id = auth.uid())
);
CREATE POLICY "Farmers can insert own feed schedules" ON feed_schedules FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feed_schedules.pond_id AND ponds.farmer_id = auth.uid())
);
CREATE POLICY "Farmers can view own feed logs" ON feed_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM feed_schedules fs JOIN ponds p ON p.id = fs.pond_id WHERE fs.id = feed_logs.schedule_id AND p.farmer_id = auth.uid())
);

-- 008: Cooperative
DO $$ BEGIN
  DROP POLICY IF EXISTS "Members can view cooperative" ON cooperatives;
  DROP POLICY IF EXISTS "Members can view members list" ON cooperative_members;
  DROP POLICY IF EXISTS "Members can view alerts" ON cooperative_alerts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    district VARCHAR(100),
    leader_id UUID REFERENCES users(id),
    member_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS cooperative_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS cooperative_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    title VARCHAR(200),
    message TEXT,
    alert_type VARCHAR(50),
    priority VARCHAR(20) CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view cooperative" ON cooperatives FOR SELECT USING (
    EXISTS (SELECT 1 FROM cooperative_members WHERE cooperative_members.cooperative_id = cooperatives.id AND cooperative_members.user_id = auth.uid())
);
CREATE POLICY "Members can view members list" ON cooperative_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM cooperative_members cm WHERE cm.cooperative_id = cooperative_members.cooperative_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Members can view alerts" ON cooperative_alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM cooperative_members WHERE cooperative_members.cooperative_id = cooperative_alerts.cooperative_id AND cooperative_members.user_id = auth.uid())
);

-- 009: Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ponds_farmer_id ON ponds(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ponds_status ON ponds(status);
CREATE INDEX IF NOT EXISTS idx_disease_farmer_id ON disease_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_pond_id ON disease_reports(pond_id);
CREATE INDEX IF NOT EXISTS idx_disease_created ON disease_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pond_id ON transactions(pond_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_pond_id ON feed_schedules(pond_id);
CREATE INDEX IF NOT EXISTS idx_feed_logs_schedule_id ON feed_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_coop_members_coop_id ON cooperative_members(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_coop_members_user_id ON cooperative_members(user_id);
CREATE INDEX IF NOT EXISTS idx_coop_alerts_coop_id ON cooperative_alerts(cooperative_id);
