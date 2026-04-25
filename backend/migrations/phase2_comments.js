require('dotenv').config();
const pool = require('../db/pool');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create post_likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );
    `);
    console.log('Created post_likes table.');

    // 2. Create post_comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created post_comments table.');

    // 3. Add comments_count to posts
    const checkCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='posts' AND column_name='comments_count'
    `);
    
    if (checkCol.rows.length === 0) {
      await client.query(`
        ALTER TABLE posts 
        ADD COLUMN comments_count INTEGER DEFAULT 0
      `);
      console.log('Added comments_count to posts.');
    } else {
      console.log('comments_count already exists in posts.');
    }

    await client.query('COMMIT');
    console.log('Comments & Likes Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
