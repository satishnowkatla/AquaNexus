-- =============================================
-- AQUANEXUS AI DATABASE SCHEMA (Supabase)
-- =============================================

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('farmer','cooperative')) DEFAULT 'farmer',
    language VARCHAR(10) CHECK (language IN ('te','hi','en')) DEFAULT 'te',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES
CREATE TABLE profiles (
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

-- PONDS
CREATE TABLE ponds (
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

-- AQUADOC
CREATE TABLE disease_reports (
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

-- AQUAVEOICE
CREATE TABLE transactions (
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

-- AQUAADVISOR
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    module VARCHAR(50) DEFAULT 'advisor',
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'te',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUAFEED
CREATE TABLE feed_schedules (
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

CREATE TABLE feed_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES feed_schedules(id),
    feed_date DATE NOT NULL,
    quantity_kg DECIMAL(8,2),
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AQUACONNECT
CREATE TABLE cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    district VARCHAR(100),
    leader_id UUID REFERENCES users(id),
    member_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooperative_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooperative_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    title VARCHAR(200),
    message TEXT,
    alert_type VARCHAR(50),
    priority VARCHAR(20) CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
