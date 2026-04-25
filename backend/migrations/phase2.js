require('dotenv').config();
const pool = require('../db/pool');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        trail_id UUID REFERENCES trails(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created posts table.');

    // 2. Add condition_status to trail_reviews
    // We check if it exists first
    const checkCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='trail_reviews' AND column_name='condition_status'
    `);
    
    if (checkCol.rows.length === 0) {
      await client.query(`
        ALTER TABLE trail_reviews 
        ADD COLUMN condition_status VARCHAR(50) DEFAULT 'Clear'
      `);
      console.log('Added condition_status to trail_reviews.');
    } else {
      console.log('condition_status already exists in trail_reviews.');
    }

    await client.query('COMMIT');
    console.log('Phase 2 Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
