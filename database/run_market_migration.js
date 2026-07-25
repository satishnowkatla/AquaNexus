const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.tptqayoquxiaupfnoqpj:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdHFheW9xdXhpYXVwZm5vcXBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc3ODE0NywiZXhwIjoyMTAwMzU0MTQ3fQ@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function migrate() {
  await client.connect();
  console.log('Connected to Supabase database');

  try {
    // Add columns
    console.log('Adding columns...');
    await client.query(`ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS min_price DECIMAL(10,2)`);
    await client.query(`ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS max_price DECIMAL(10,2)`);
    await client.query(`ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'benchmark'`);
    await client.query(`ALTER TABLE market_prices ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'per_kg'`);
    console.log('Columns added');

    // Clear old data
    console.log('Clearing old prices...');
    await client.query('TRUNCATE TABLE market_prices');
    console.log('Old data cleared');

    // Insert AGMARKNET Government Mandi data
    console.log('Inserting AGMARKNET prices...');
    await client.query(`
      INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit)
      VALUES ('Katla', 'Small', 99.00, 98.00, 100.00, 'Mummidivaram APMC', 'Dr.B.R.A.Konaseema', CURRENT_DATE, 'stable', 'agmarknet', 'per_kg')
    `);

    // Insert Vannamei Shrimp prices
    console.log('Inserting Vannamei prices...');
    await client.query(`
      INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit) VALUES
      ('Vannamei Shrimp', 'Super Jumbo (16-20)', 580.00, 560.00, 600.00, 'Nellore Processing Hub', 'Nellore', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
      ('Vannamei Shrimp', 'Jumbo (21-25)', 520.00, 500.00, 540.00, 'Nellore Processing Hub', 'Nellore', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
      ('Vannamei Shrimp', 'Large (26-30)', 460.00, 440.00, 480.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
      ('Vannamei Shrimp', 'Medium (31-40)', 420.00, 400.00, 440.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
      ('Vannamei Shrimp', 'Small (41-60)', 340.00, 320.00, 360.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'down', 'benchmark', 'per_kg'),
      ('Vannamei Shrimp', 'Small-Indian (61-80)', 280.00, 260.00, 300.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'down', 'benchmark', 'per_kg')
    `);

    // Insert Tiger Prawn prices
    console.log('Inserting Tiger Prawn prices...');
    await client.query(`
      INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit) VALUES
      ('Tiger Prawn', 'Large (16-20)', 780.00, 750.00, 810.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
      ('Tiger Prawn', 'Medium (21-30)', 680.00, 650.00, 710.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
      ('Tiger Prawn', 'Small (31-40)', 540.00, 510.00, 570.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'down', 'benchmark', 'per_kg')
    `);

    // Insert Indian Major Carps
    console.log('Inserting Indian Major Carps...');
    await client.query(`
      INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit) VALUES
      ('Rohu (Labeo rohita)', 'Live Whole', 185.00, 170.00, 200.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
      ('Catla (Catla catla)', 'Live Whole', 170.00, 155.00, 185.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
      ('Mrigal (Cirrhinus mrigala)', 'Live Whole', 140.00, 125.00, 155.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'stable', 'benchmark', 'per_kg')
    `);

    // Insert Other Species
    console.log('Inserting other species...');
    await client.query(`
      INSERT INTO market_prices (species, variety, price_per_kg, min_price, max_price, market_name, district, price_date, trend, data_source, unit) VALUES
      ('Murrel (Channa striata)', 'Live Whole', 320.00, 300.00, 340.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
      ('Pangasius', 'Whole Fish', 120.00, 110.00, 130.00, 'Guntur Market', 'Guntur', CURRENT_DATE, 'down', 'benchmark', 'per_kg'),
      ('Tilapia (Jehlangeer)', 'Live Whole', 150.00, 140.00, 160.00, 'Vijayawada Market', 'Krishna', CURRENT_DATE, 'stable', 'benchmark', 'per_kg'),
      ('Walking Catfish (Clarias)', 'Live Whole', 280.00, 260.00, 300.00, 'Machilipatnam Market', 'Krishna', CURRENT_DATE, 'up', 'benchmark', 'per_kg'),
      ('Freshwater Prawns (Macrobrachium)', 'Large', 450.00, 430.00, 470.00, 'Kakinada Market', 'East Godavari', CURRENT_DATE, 'stable', 'benchmark', 'per_kg')
    `);

    // Verify
    const result = await client.query('SELECT species, variety, price_per_kg, data_source FROM market_prices ORDER BY data_source, species');
    console.log(`\n✅ Migration complete! ${result.rowCount} prices inserted:\n`);
    result.rows.forEach(r => {
      console.log(`  [${r.data_source}] ${r.species} - ${r.variety}: ₹${r.price_per_kg}/kg`);
    });

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
