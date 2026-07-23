-- =============================================
-- 004: Create Disease Reports Table (AquaDoc)
-- =============================================

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

-- Enable Row Level Security
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Farmers can view own reports" ON disease_reports
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own reports" ON disease_reports
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);
