-- =============================================
-- DEV: AquaConnect v2 - Community + Market
-- =============================================
-- Run this in Supabase SQL Editor

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES cooperatives(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    post_type VARCHAR(30) CHECK (post_type IN ('question','tip','alert','general')) DEFAULT 'general',
    image_url TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market prices table
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    price_per_kg DECIMAL(10,2) NOT NULL,
    market_name VARCHAR(200),
    district VARCHAR(100),
    price_date DATE DEFAULT CURRENT_DATE,
    trend VARCHAR(10) CHECK (trend IN ('up','down','stable')) DEFAULT 'stable',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices DISABLE ROW LEVEL SECURITY;

-- Grant
GRANT ALL ON community_posts TO anon;
GRANT ALL ON community_posts TO authenticated;
GRANT ALL ON market_prices TO anon;
GRANT ALL ON market_prices TO authenticated;

-- =============================================
-- SEED: Community posts
-- =============================================
INSERT INTO community_posts (cooperative_id, user_id, content, post_type, likes_count, comments_count, created_at)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM users LIMIT 1),
    'Has anyone tried biofloc technology? My water quality improved a lot after switching. Happy to share tips!',
    'tip',
    12,
    5,
    NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM users LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%biofloc%');

INSERT INTO community_posts (cooperative_id, user_id, content, post_type, likes_count, comments_count, created_at)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM users LIMIT 1),
    'Warning: White spot disease reported in 3 farms near Machilipatnam. Check your ponds immediately and add salt if needed.',
    'alert',
    24,
    18,
    NOW() - INTERVAL '6 hours'
WHERE EXISTS (SELECT 1 FROM users LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%White spot disease%');

INSERT INTO community_posts (cooperative_id, user_id, content, post_type, likes_count, comments_count, created_at)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM users LIMIT 1),
    'What is the best feed brand for Vannamei shrimp in Andhra Pradesh? Currently using CP Feed but looking for alternatives.',
    'question',
    8,
    11,
    NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM users LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%best feed brand%');

INSERT INTO community_posts (cooperative_id, user_id, content, post_type, likes_count, comments_count, created_at)
SELECT
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM users LIMIT 1),
    'Just harvested 2 tons from my 0.5 acre pond! Feed conversion ratio was 1.4. Very happy with the results this season.',
    'general',
    31,
    7,
    NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM users LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%harvested 2 tons%');

-- =============================================
-- SEED: Market prices (real Andhra Pradesh aquaculture prices)
-- =============================================
INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Vannamei Shrimp', 'Jumbo (31-40)', 520.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'up'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Vannamei Shrimp' AND variety = 'Jumbo (31-40)');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Vannamei Shrimp', 'Medium (41-60)', 420.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'stable'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Vannamei Shrimp' AND variety = 'Medium (41-60)');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Vannamei Shrimp', 'Small (61-80)', 340.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'down'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Vannamei Shrimp' AND variety = 'Small (61-80)');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Rohu (Labeo rohita)', 'Whole Fish', 185.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'up'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Rohu (Labeo rohita)' AND variety = 'Whole Fish');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Catla (Catla catla)', 'Whole Fish', 170.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'stable'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Catla (Catla catla)' AND variety = 'Whole Fish');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Murrel (Channa striata)', 'Whole Fish', 320.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'up'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Murrel (Channa striata)' AND variety = 'Whole Fish');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Pangasius', 'Fillets', 210.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'down'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Pangasius' AND variety = 'Fillets');

INSERT INTO market_prices (species, variety, price_per_kg, market_name, district, price_date, trend)
SELECT 'Tiger Prawn', 'Large (21-30)', 680.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'up'
WHERE NOT EXISTS (SELECT 1 FROM market_prices WHERE species = 'Tiger Prawn' AND variety = 'Large (21-30)');
