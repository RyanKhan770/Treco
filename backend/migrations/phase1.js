require('dotenv').config();
const pool = require('../db/pool');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. recorded_tracks
    await client.query(`
      CREATE TABLE IF NOT EXISTS recorded_tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) DEFAULT 'Afternoon Trek',
        coordinates JSONB NOT NULL DEFAULT '[]'::jsonb,
        distance_km NUMERIC(10, 2) DEFAULT 0.0,
        duration_minutes INTEGER DEFAULT 0,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created recorded_tracks table.');

    // 2. emergency_contacts
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        relation VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created emergency_contacts table.');

    // 3. sos_alerts
    await client.query(`
      CREATE TABLE IF NOT EXISTS sos_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        last_latitude NUMERIC(10, 6),
        last_longitude NUMERIC(10, 6),
        status VARCHAR(50) DEFAULT 'active', -- active, resolved
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      );
    `);
    console.log('Created sos_alerts table.');

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
