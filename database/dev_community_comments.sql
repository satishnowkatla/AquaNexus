-- Community comments table
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_comments DISABLE ROW LEVEL SECURITY;
GRANT ALL ON community_comments TO anon;
GRANT ALL ON community_comments TO authenticated;

-- Seed comments on existing posts
INSERT INTO community_comments (post_id, user_id, content, created_at)
SELECT
    (SELECT id FROM community_posts WHERE content LIKE '%biofloc%' LIMIT 1),
    (SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1),
    'Yes! Biofloc works great. What temperature are you maintaining?',
    NOW() - INTERVAL '1 hour 30 minutes'
WHERE EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%biofloc%')
AND EXISTS (SELECT 1 FROM users OFFSET 1)
AND NOT EXISTS (SELECT 1 FROM community_comments WHERE content LIKE '%What temperature%');

INSERT INTO community_comments (post_id, user_id, content, created_at)
SELECT
    (SELECT id FROM community_posts WHERE content LIKE '%biofloc%' LIMIT 1),
    (SELECT id FROM users ORDER BY created_at LIMIT 1),
    'I keep it at 28-30C. Carbon source: molasses, 5g per litre.',
    NOW() - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%biofloc%')
AND EXISTS (SELECT 1 FROM users)
AND NOT EXISTS (SELECT 1 FROM community_comments WHERE content LIKE '%molasses%');

INSERT INTO community_comments (post_id, user_id, content, created_at)
SELECT
    (SELECT id FROM community_posts WHERE content LIKE '%White spot disease%' LIMIT 1),
    (SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 2),
    'Thanks for the warning! I am near Machilipatnam, adding salt to my ponds today.',
    NOW() - INTERVAL '5 hours'
WHERE EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%White spot disease%')
AND EXISTS (SELECT 1 FROM users OFFSET 2)
AND NOT EXISTS (SELECT 1 FROM community_comments WHERE content LIKE '%adding salt%');

INSERT INTO community_comments (post_id, user_id, content, created_at)
SELECT
    (SELECT id FROM community_posts WHERE content LIKE '%White spot disease%' LIMIT 1),
    (SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 3),
    'Also try lowering stocking density if you see symptoms. UV light helps too.',
    NOW() - INTERVAL '4 hours 30 minutes'
WHERE EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%White spot disease%')
AND EXISTS (SELECT 1 FROM users OFFSET 3)
AND NOT EXISTS (SELECT 1 FROM community_comments WHERE content LIKE '%UV light%');

INSERT INTO community_comments (post_id, user_id, content, created_at)
SELECT
    (SELECT id FROM community_posts WHERE content LIKE '%best feed brand%' LIMIT 1),
    (SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 4),
    'Try Growel Feeds. Good FCR and competitive pricing.',
    NOW() - INTERVAL '20 hours'
WHERE EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%best feed brand%')
AND EXISTS (SELECT 1 FROM users OFFSET 4)
AND NOT EXISTS (SELECT 1 FROM community_comments WHERE content LIKE '%Growel%');

INSERT INTO community_comments (post_id, user_id, content, created_at)
SELECT
    (SELECT id FROM community_posts WHERE content LIKE '%harvested 2 tons%' LIMIT 1),
    (SELECT id FROM users ORDER BY created_at LIMIT 1),
    'Great FCR! What feed did you use? How many days cycle?',
    NOW() - INTERVAL '1 day 20 hours'
WHERE EXISTS (SELECT 1 FROM community_posts WHERE content LIKE '%harvested 2 tons%')
AND EXISTS (SELECT 1 FROM users)
AND NOT EXISTS (SELECT 1 FROM community_comments WHERE content LIKE '%How many days%');
