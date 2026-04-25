require('dotenv').config();
const pool = require('../db/pool');

async function migrate() {
  try {
    await pool.query(`ALTER TABLE groups ADD COLUMN IF NOT EXISTS group_photo VARCHAR(255)`);
    console.log('Successfully added group_photo to groups table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}
migrate();
