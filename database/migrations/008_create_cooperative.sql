-- =============================================
-- 008: Create Cooperative Tables (AquaConnect)
-- =============================================

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

-- Enable Row Level Security
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view cooperative" ON cooperatives
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM cooperative_members WHERE cooperative_members.cooperative_id = cooperatives.id AND cooperative_members.user_id = auth.uid())
    );

CREATE POLICY "Members can view members list" ON cooperative_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM cooperative_members cm WHERE cm.cooperative_id = cooperative_members.cooperative_id AND cm.user_id = auth.uid())
    );

CREATE POLICY "Members can view alerts" ON cooperative_alerts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM cooperative_members WHERE cooperative_members.cooperative_id = cooperative_alerts.cooperative_id AND cooperative_members.user_id = auth.uid())
    );
