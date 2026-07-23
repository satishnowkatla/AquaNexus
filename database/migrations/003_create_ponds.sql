-- =============================================
-- 003: Create Ponds Table
-- =============================================

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

-- Enable Row Level Security
ALTER TABLE ponds ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Farmers can view own ponds" ON ponds
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own ponds" ON ponds
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own ponds" ON ponds
    FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own ponds" ON ponds
    FOR DELETE USING (auth.uid() = farmer_id);
