-- =============================================
-- Farmer-to-Farmer Messaging
-- =============================================
-- Run this in Supabase SQL Editor

-- Conversations between two farmers
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (farmer_a, farmer_b)
);

-- Messages inside a conversation
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_farmer ON conversations(farmer_a, farmer_b);

-- Dev: open all (no auth required)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

GRANT ALL ON conversations TO anon;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
