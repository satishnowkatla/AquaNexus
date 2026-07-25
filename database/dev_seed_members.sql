-- =============================================
-- DEV: Real AP Fish Farmer Directory Seed
-- Run in Supabase SQL Editor
-- =============================================

-- Clear old seed data
DELETE FROM ponds WHERE farmer_id::text LIKE '11111111%';
DELETE FROM cooperative_members WHERE user_id::text LIKE '11111111%';
DELETE FROM profiles WHERE user_id::text LIKE '11111111%';
DELETE FROM users WHERE id::text LIKE '11111111%';

-- =============================================
-- KRISHNA DISTRICT (Machilipatnam, Vijayawada, Gudivada)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111101', '+919848123456', 'Ramanayya Goud', 'farmer', 'te', NOW() - INTERVAL '90 days'),
  ('11111111-1111-1111-1111-111111111102', '+919849234567', 'Srinivasa Rao', 'farmer', 'te', NOW() - INTERVAL '85 days'),
  ('11111111-1111-1111-1111-111111111103', '+919701345678', 'Murali Krishna', 'farmer', 'te', NOW() - INTERVAL '80 days'),
  ('11111111-1111-1111-1111-111111111104', '+919989456789', 'Babaiah Naidu', 'farmer', 'te', NOW() - INTERVAL '75 days'),
  ('11111111-1111-1111-1111-111111111105', '+918500567890', 'Lakshmi Devi', 'farmer', 'te', NOW() - INTERVAL '70 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Krishna', 'Vuyyuru', '521165', 3.5, 'shrimp', 12),
  ('11111111-1111-1111-1111-111111111102', 'Krishna', 'Gudivada', '521301', 5.0, 'shrimp', 8),
  ('11111111-1111-1111-1111-111111111103', 'Krishna', 'Machilipatnam', '521001', 8.0, 'shrimp', 15),
  ('11111111-1111-1111-1111-111111111104', 'Krishna', 'Nandigama', '521185', 4.2, 'prawn', 10),
  ('11111111-1111-1111-1111-111111111105', 'Krishna', 'Vijayawada', '520001', 2.8, 'fish', 6);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Pond-1 East', 2.0, 'Vannamei Shrimp', 80000, '2026-04-15', '2026-07-30', 'active'),
  ('11111111-1111-1111-1111-111111111101', 'Pond-2 West', 1.5, 'Vannamei Shrimp', 75000, '2026-05-01', '2026-08-15', 'active'),
  ('11111111-1111-1111-1111-111111111102', 'Main Pond', 3.0, 'Vannamei Shrimp', 85000, '2026-03-20', '2026-07-10', 'active'),
  ('11111111-1111-1111-1111-111111111102', 'Nursery Pond', 2.0, 'Vannamei Shrimp', 120000, '2026-06-01', '2026-08-20', 'active'),
  ('11111111-1111-1111-1111-111111111103', 'Pond-A', 4.0, 'Tiger Prawn', 60000, '2026-03-10', '2026-07-25', 'active'),
  ('11111111-1111-1111-1111-111111111103', 'Pond-B', 2.5, 'Vannamei Shrimp', 80000, '2026-04-20', '2026-08-05', 'active'),
  ('11111111-1111-1111-1111-111111111103', 'Pond-C', 1.5, 'Tiger Prawn', 55000, '2026-05-10', '2026-09-01', 'active'),
  ('11111111-1111-1111-1111-111111111104', 'Main Pond', 2.5, 'Indian White Prawn', 70000, '2026-04-01', '2026-07-20', 'active'),
  ('11111111-1111-1111-1111-111111111104', 'Secondary Pond', 1.7, 'Freshwater Prawns', 40000, '2026-05-15', '2026-09-10', 'active'),
  ('11111111-1111-1111-1111-111111111105', 'Fish Pond', 2.8, 'Rohu + Catla', 5000, '2026-02-10', '2026-12-10', 'active');

-- =============================================
-- WEST GODAVARI (Eluru, Bhimavaram, Tanuku)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111106', '+919496678901', 'Rajesh Kumar', 'farmer', 'te', NOW() - INTERVAL '65 days'),
  ('11111111-1111-1111-1111-111111111107', '+917989789012', 'Prasad Reddy', 'farmer', 'te', NOW() - INTERVAL '60 days'),
  ('11111111-1111-1111-1111-111111111108', '+919390890123', 'Sunitha Rani', 'farmer', 'te', NOW() - INTERVAL '55 days'),
  ('11111111-1111-1111-1111-111111111109', '+919912901234', 'Venkateswarlu', 'farmer', 'te', NOW() - INTERVAL '50 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111106', 'West Godavari', 'Bhimavaram', '534201', 6.0, 'shrimp', 9),
  ('11111111-1111-1111-1111-111111111107', 'West Godavari', 'Eluru', '534001', 4.5, 'shrimp', 14),
  ('11111111-1111-1111-1111-111111111108', 'West Godavari', 'Tanuku', '534211', 3.0, 'prawn', 5),
  ('11111111-1111-1111-1111-111111111109', 'West Godavari', 'Narsapur', '534270', 7.5, 'shrimp', 11);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111106', 'Pond-1', 3.0, 'Vannamei Shrimp', 90000, '2026-04-01', '2026-07-15', 'active'),
  ('11111111-1111-1111-1111-111111111106', 'Pond-2', 3.0, 'Tiger Prawn', 65000, '2026-05-05', '2026-08-25', 'active'),
  ('11111111-1111-1111-1111-111111111107', 'Main Pond', 3.0, 'Vannamei Shrimp', 80000, '2026-03-15', '2026-07-01', 'active'),
  ('11111111-1111-1111-1111-111111111107', 'Expansion Pond', 1.5, 'Vannamei Shrimp', 80000, '2026-05-20', '2026-09-05', 'active'),
  ('11111111-1111-1111-1111-111111111108', 'Pond-A', 1.5, 'Indian White Prawn', 65000, '2026-04-10', '2026-07-25', 'active'),
  ('11111111-1111-1111-1111-111111111108', 'Pond-B', 1.5, 'Freshwater Prawns', 35000, '2026-06-01', '2026-10-15', 'active'),
  ('11111111-1111-1111-1111-111111111109', 'Pond-1', 4.0, 'Vannamei Shrimp', 85000, '2026-03-25', '2026-07-10', 'active'),
  ('11111111-1111-1111-1111-111111111109', 'Pond-2', 2.0, 'Vannamei Shrimp', 85000, '2026-04-15', '2026-08-01', 'active'),
  ('11111111-1111-1111-1111-111111111109', 'Pond-3', 1.5, 'Tiger Prawn', 60000, '2026-05-10', '2026-09-01', 'active');

-- =============================================
-- EAST GODAVARI (Kakinada, Rajahmundry)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111110', '+919885012345', 'Durga Prasad', 'farmer', 'te', NOW() - INTERVAL '45 days'),
  ('11111111-1111-1111-1111-111111111111', '+919676123456', 'Suresh Babu', 'farmer', 'te', NOW() - INTERVAL '40 days'),
  ('11111111-1111-1111-1111-111111111112', '+919533234567', 'Annapurna', 'farmer', 'te', NOW() - INTERVAL '35 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111110', 'East Godavari', 'Kakinada', '533001', 5.5, 'shrimp', 7),
  ('11111111-1111-1111-1111-111111111111', 'East Godavari', 'Rajahmundry', '533101', 4.0, 'fish', 13),
  ('11111111-1111-1111-1111-111111111112', 'East Godavari', 'Amalapuram', '533201', 3.2, 'prawn', 8);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111110', 'Pond-1', 3.0, 'Vannamei Shrimp', 80000, '2026-04-05', '2026-07-20', 'active'),
  ('11111111-1111-1111-1111-111111111110', 'Pond-2', 2.5, 'Tiger Prawn', 60000, '2026-05-15', '2026-09-01', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'Fish Pond-1', 2.5, 'Rohu + Catla', 6000, '2026-01-15', '2026-11-15', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'Fish Pond-2', 1.5, 'Rohu + Mrigal', 5000, '2026-03-01', '2026-12-01', 'active'),
  ('11111111-1111-1111-1111-111111111112', 'Pond-A', 2.0, 'Indian White Prawn', 70000, '2026-04-20', '2026-08-05', 'active'),
  ('11111111-1111-1111-1111-111111111112', 'Pond-B', 1.2, 'Freshwater Prawns', 40000, '2026-06-10', '2026-10-20', 'active');

-- =============================================
-- GUNTUR (Tenali, Repalle, Mangalagiri)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111113', '+919849567890', 'Rajendra Prasad', 'farmer', 'te', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111114', '+919705678901', 'Koteswara Rao', 'farmer', 'te', NOW() - INTERVAL '25 days'),
  ('11111111-1111-1111-1111-111111111115', '+919989789012', 'Padmavathi', 'farmer', 'te', NOW() - INTERVAL '20 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111113', 'Guntur', 'Tenali', '522201', 5.0, 'shrimp', 10),
  ('11111111-1111-1111-1111-111111111114', 'Guntur', 'Repalle', '522265', 3.8, 'shrimp', 7),
  ('11111111-1111-1111-1111-111111111115', 'Guntur', 'Mangalagiri', '522503', 2.5, 'fish', 4);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111113', 'Pond-1', 2.5, 'Vannamei Shrimp', 85000, '2026-04-10', '2026-07-25', 'active'),
  ('11111111-1111-1111-1111-111111111113', 'Pond-2', 2.5, 'Tiger Prawn', 60000, '2026-05-20', '2026-09-10', 'active'),
  ('11111111-1111-1111-1111-111111111114', 'Main Pond', 2.0, 'Vannamei Shrimp', 80000, '2026-03-28', '2026-07-12', 'active'),
  ('11111111-1111-1111-1111-111111111114', 'Secondary', 1.8, 'Indian White Prawn', 65000, '2026-05-01', '2026-08-20', 'active'),
  ('11111111-1111-1111-1111-111111111115', 'Pond-A', 1.5, 'Rohu + Catla', 5500, '2026-02-20', '2026-11-20', 'active'),
  ('11111111-1111-1111-1111-111111111115', 'Pond-B', 1.0, 'Murrel', 4000, '2026-03-15', '2026-12-15', 'active');

-- =============================================
-- NELLORE (Nellore, Kavali, Gudur)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111116', '+919842123456', 'Narayana Reddy', 'farmer', 'te', NOW() - INTERVAL '88 days'),
  ('11111111-1111-1111-1111-111111111117', '+919440234567', 'Seshu Kumar', 'farmer', 'te', NOW() - INTERVAL '82 days'),
  ('11111111-1111-1111-1111-111111111118', '+919866345678', 'Ramesh Naidu', 'farmer', 'te', NOW() - INTERVAL '76 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111116', 'Nellore', 'Sullurpeta', '524121', 8.0, 'shrimp', 16),
  ('11111111-1111-1111-1111-111111111117', 'Nellore', 'Gudur', '524101', 5.0, 'shrimp', 11),
  ('11111111-1111-1111-1111-111111111118', 'Nellore', 'Kavali', '524201', 3.5, 'prawn', 9);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111116', 'Pond-1', 3.0, 'Vannamei Shrimp', 90000, '2026-03-10', '2026-06-25', 'active'),
  ('11111111-1111-1111-1111-111111111116', 'Pond-2', 2.5, 'Vannamei Shrimp', 90000, '2026-04-01', '2026-07-15', 'active'),
  ('11111111-1111-1111-1111-111111111116', 'Pond-3', 2.5, 'Tiger Prawn', 65000, '2026-05-10', '2026-08-25', 'active'),
  ('11111111-1111-1111-1111-111111111117', 'Main Pond', 3.0, 'Vannamei Shrimp', 85000, '2026-03-20', '2026-07-05', 'active'),
  ('11111111-1111-1111-1111-111111111117', 'Nursery', 2.0, 'Vannamei Shrimp', 120000, '2026-06-05', '2026-08-15', 'active'),
  ('11111111-1111-1111-1111-111111111118', 'Pond-A', 2.0, 'Indian White Prawn', 70000, '2026-04-15', '2026-07-30', 'active'),
  ('11111111-1111-1111-1111-111111111118', 'Pond-B', 1.5, 'Tiger Prawn', 55000, '2026-05-25', '2026-09-10', 'active');

-- =============================================
-- SRIKAKULAM (Srikakulam, Palasa, Amadalavalasa)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111119', '+919894123456', 'Krishna Murthy', 'farmer', 'te', NOW() - INTERVAL '72 days'),
  ('11111111-1111-1111-1111-111111111120', '+919441234567', 'Govinda Raju', 'farmer', 'te', NOW() - INTERVAL '68 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111119', 'Srikakulam', 'Palasa', '532221', 4.0, 'shrimp', 8),
  ('11111111-1111-1111-1111-111111111120', 'Srikakulam', 'Srikakulam', '532001', 3.0, 'fish', 12);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111119', 'Pond-1', 2.5, 'Vannamei Shrimp', 80000, '2026-04-12', '2026-07-28', 'active'),
  ('11111111-1111-1111-1111-111111111119', 'Pond-2', 1.5, 'Indian White Prawn', 65000, '2026-05-18', '2026-09-05', 'active'),
  ('11111111-1111-1111-1111-111111111120', 'Pond-A', 1.8, 'Rohu + Catla', 5000, '2026-02-05', '2026-11-05', 'active'),
  ('11111111-1111-1111-1111-111111111120', 'Pond-B', 1.2, 'Murrel', 4000, '2026-03-20', '2026-12-20', 'active');

-- =============================================
-- VISAKHAPATNAM (Visakhapatnam, Anakapalle, Bheemunipatnam)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111121', '+919848234567', 'Appala Naidu', 'farmer', 'te', NOW() - INTERVAL '42 days'),
  ('11111111-1111-1111-1111-111111111122', '+919703345678', 'Seetharama Raju', 'farmer', 'te', NOW() - INTERVAL '38 days'),
  ('11111111-1111-1111-1111-111111111123', '+919538456789', 'Lakshmi Narasimham', 'farmer', 'te', NOW() - INTERVAL '32 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111121', 'Visakhapatnam', 'Anakapalle', '531001', 4.5, 'shrimp', 10),
  ('11111111-1111-1111-1111-111111111122', 'Visakhapatnam', 'Bheemunipatnam', '531031', 3.0, 'fish', 15),
  ('11111111-1111-1111-1111-111111111123', 'Visakhapatnam', 'Payakaraopeta', '531035', 2.0, 'prawn', 6);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111121', 'Pond-1', 2.5, 'Vannamei Shrimp', 80000, '2026-04-08', '2026-07-22', 'active'),
  ('11111111-1111-1111-1111-111111111121', 'Pond-2', 2.0, 'Tiger Prawn', 60000, '2026-05-12', '2026-08-28', 'active'),
  ('11111111-1111-1111-1111-111111111122', 'Marine Pond-1', 2.0, 'Seabass', 12000, '2026-03-01', '2026-09-01', 'active'),
  ('11111111-1111-1111-1111-111111111122', 'Marine Pond-2', 1.0, 'Mullet', 10000, '2026-04-10', '2026-10-10', 'active'),
  ('11111111-1111-1111-1111-111111111123', 'Pond-A', 1.2, 'Indian White Prawn', 70000, '2026-04-25', '2026-08-10', 'active'),
  ('11111111-1111-1111-1111-111111111123', 'Pond-B', 0.8, 'Freshwater Prawns', 35000, '2026-06-15', '2026-10-30', 'active');

-- =============================================
-- PRAKASAM (Ongole, Chirala, Kandukur)
-- =============================================
INSERT INTO users (id, phone, full_name, role, language, created_at) VALUES
  ('11111111-1111-1111-1111-111111111124', '+919814567890', 'Veerabhadra Rao', 'farmer', 'te', NOW() - INTERVAL '58 days'),
  ('11111111-1111-1111-1111-111111111125', '+919567678901', 'Siva Rama Krishna', 'farmer', 'te', NOW() - INTERVAL '52 days');

INSERT INTO profiles (user_id, district, village, pincode, total_pond_area, primary_species, years_experience) VALUES
  ('11111111-1111-1111-1111-111111111124', 'Prakasam', 'Chirala', '523157', 5.5, 'shrimp', 12),
  ('11111111-1111-1111-1111-111111111125', 'Prakasam', 'Ongole', '523001', 3.0, 'shrimp', 7);

INSERT INTO ponds (farmer_id, name, area_acres, species, stocking_density, stocking_date, expected_harvest_date, status) VALUES
  ('11111111-1111-1111-1111-111111111124', 'Pond-1', 3.0, 'Vannamei Shrimp', 85000, '2026-03-25', '2026-07-08', 'active'),
  ('11111111-1111-1111-1111-111111111124', 'Pond-2', 2.5, 'Tiger Prawn', 60000, '2026-05-05', '2026-08-20', 'active'),
  ('11111111-1111-1111-1111-111111111125', 'Main Pond', 1.8, 'Vannamei Shrimp', 80000, '2026-04-15', '2026-07-30', 'active'),
  ('11111111-1111-1111-1111-111111111125', 'Nursery', 1.2, 'Vannamei Shrimp', 120000, '2026-06-10', '2026-08-25', 'active');

-- Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON profiles TO anon;
GRANT ALL ON ponds TO anon;
