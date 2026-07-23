-- =============================================
-- 007: Create Feed Tables (AquaFeed)
-- =============================================

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

-- Enable Row Level Security
ALTER TABLE feed_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_logs ENABLE ROW LEVEL SECURITY;

-- Policies (using pond farmer_id)
CREATE POLICY "Farmers can view own feed schedules" ON feed_schedules
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feed_schedules.pond_id AND ponds.farmer_id = auth.uid())
    );

CREATE POLICY "Farmers can insert own feed schedules" ON feed_schedules
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ponds WHERE ponds.id = feed_schedules.pond_id AND ponds.farmer_id = auth.uid())
    );

CREATE POLICY "Farmers can view own feed logs" ON feed_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM feed_schedules fs
            JOIN ponds p ON p.id = fs.pond_id
            WHERE fs.id = feed_logs.schedule_id AND p.farmer_id = auth.uid()
        )
    );
