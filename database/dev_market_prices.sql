-- =============================================
-- DEV: Enhanced Market Prices for AP Aquaculture
-- Run in Supabase SQL Editor
-- =============================================

-- Add missing columns to market_prices
ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS min_price DECIMAL(10,2);
ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS max_price DECIMAL(10,2);
ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'benchmark';
ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'per_kg';

-- Clear old seeded data
TRUNCATE TABLE market_prices;

-- =============================================
-- SECTION 1: AGMARKNET Government Mandi Prices
-- Source: agmarknet.gov.in via napanta.com
-- =============================================
INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit)
VALUES
('Katla', 'Small', 99.00, 98.00, 100.00, 'Mummidivaram APMC', 'Dr.B.R.A.Konaseema', CURRENT_DATE, 'stable', 'agmarknet', 'per_kg');

-- =============================================
-- SECTION 2: Vannamei Shrimp (Whiteleg Shrimp)
-- AP's primary aquaculture export species
-- Prices from processing plant procurement rates
-- =============================================
INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit)
VALUES
('Vannamei Shrimp', 'Super Jumbo (16-20)', 580.00, 560.00, 600.00, 'Nellore Processing Hub', 'Nellore', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
('Vannamei Shrimp', 'Jumbo (21-25)', 520.00, 500.00, 540.00, 'Nellore Processing Hub', 'Nellore', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
('Vannamei Shrimp', 'Large (26-30)', 460.00, 440.00, 480.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
('Vannamei Shrimp', 'Medium (31-40)', 420.00, 400.00, 440.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
('Vannamei Shrimp', 'Small (41-60)', 340.00, 320.00, 360.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'down', 'benchmark', 'per_kg'),
('Vannamei Shrimp', 'Small-Indian (61-80)', 280.00, 260.00, 300.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'down', 'benchmark', 'per_kg');

-- =============================================
-- SECTION 3: Tiger Prawn (Black Tiger Shrimp)
-- Premium species, higher price
-- =============================================
INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit)
VALUES
('Tiger Prawn', 'Large (16-20)', 780.00, 750.00, 810.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
('Tiger Prawn', 'Medium (21-30)', 680.00, 650.00, 710.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
('Tiger Prawn', 'Small (31-40)', 540.00, 510.00, 570.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'down', 'benchmark', 'per_kg');

-- =============================================
-- SECTION 4: Indian Major Carps (Freshwater)
-- Commonly cultured alongside shrimp
-- =============================================
INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit)
VALUES
('Rohu (Labeo rohita)', 'Live Whole', 185.00, 170.00, 200.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
('Catla (Catla catla)', 'Live Whole', 170.00, 155.00, 185.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
('Mrigal (Cirrhinus mrigala)', 'Live Whole', 140.00, 125.00, 155.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'stable', 'benchmark', 'per_kg');

-- =============================================
-- SECTION 5: Other Popular Species
-- =============================================
INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit)
VALUES
('Murrel (Channa striata)', 'Live Whole', 320.00, 300.00, 340.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
('Pangasius', 'Whole Fish', 120.00, 110.00, 130.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'down', 'benchmark', 'per_kg'),
('Tilapia (Jehlangeer)', 'Live Whole', 150.00, 140.00, 160.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
('Walking Catla (Clarias batrachus)', 'Live Whole', 280.00, 260.00, 300.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
('Freshwater Prawns (Macrobrachium)', 'Large', 450.00, 430.00, 470.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'stable', 'benchmark', 'per_kg');

-- Grant permissions
GRANT ALL ON market_prices TO anon;
GRANT ALL ON market_prices TO authenticated;
