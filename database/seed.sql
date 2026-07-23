-- =============================================
-- SEED DATA (For Testing)
-- Run each section separately if needed
-- =============================================

-- 1. Sample Users (skip if phone exists)
INSERT INTO users (id, phone, full_name, role, language)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '+919876543210', 'Ravi Kumar', 'farmer', 'te'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '+919876543210');

INSERT INTO users (id, phone, full_name, role, language)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '+919876543211', 'Suresh Babu', 'farmer', 'te'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '+919876543211');

INSERT INTO users (id, phone, full_name, role, language)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '+919876543212', 'Lakshmi Devi', 'farmer', 'hi'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '+919876543212');

INSERT INTO users (id, phone, full_name, role, language)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '+919876543213', 'Venkatesh Rao', 'cooperative', 'en'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '+919876543213');
