-- =============================================
-- 005: Create Transactions Table (AquaVoice)
-- =============================================

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

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Farmers can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = farmer_id);
