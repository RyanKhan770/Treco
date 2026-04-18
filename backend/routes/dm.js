/**
 * Direct Messages — /api/dm
 *
 * Uses a lightweight dm_messages table. The "conversation" between two
 * users is identified by sorting their IDs so (A,B) == (B,A).
 *
 * Table DDL (run once):
 *   CREATE TABLE IF NOT EXISTS dm_messages (
 *     id          SERIAL PRIMARY KEY,
 *     sender_id   INTEGER NOT NULL REFERENCES users(id),
 *     receiver_id INTEGER NOT NULL REFERENCES users(id),
 *     content     TEXT NOT NULL,
 *     read        BOOLEAN DEFAULT FALSE,
 *     created_at  TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   CREATE INDEX IF NOT EXISTS dm_convo_idx
 *     ON dm_messages (LEAST(sender_id,receiver_id), GREATEST(sender_id,receiver_id), created_at);
 */

const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dm/inbox  — list of recent DM conversations for the current user
router.get('/inbox', auth, async (req, res) => {
  try {
    // One row per conversation partner, showing the latest message
    const result = await pool.query(
      `SELECT DISTINCT ON (partner_id)
         partner_id,
         u.name         AS partner_name,
         u.profile_photo AS partner_photo,
         u.role         AS partner_role,
         u.is_verified  AS partner_verified,
         dm.content     AS last_message,
         dm.sender_id   AS last_sender_id,
         dm.created_at  AS last_at,
         (SELECT COUNT(*) FROM dm_messages
          WHERE receiver_id = $1 AND sender_id = partner_id AND read = FALSE) AS unread_count
       FROM (
         SELECT
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partner_id,
           id, content, sender_id, created_at
         FROM dm_messages
         WHERE sender_id = $1 OR receiver_id = $1
       ) dm
       JOIN users u ON u.id = dm.partner_id
       ORDER BY partner_id, dm.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dm/:userId  — get conversation history with a specific user
router.get('/:userId', auth, async (req, res) => {
  const other = parseInt(req.params.userId, 10);
  const me    = req.user.id;
  try {
    const result = await pool.query(
      `SELECT dm.*, u.name AS sender_name, u.profile_photo AS sender_photo
       FROM dm_messages dm
       JOIN users u ON u.id = dm.sender_id
       WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
          OR (dm.sender_id = $2 AND dm.receiver_id = $1)
       ORDER BY dm.created_at ASC
       LIMIT 100`,
      [me, other]
    );
    // Mark received messages as read
    await pool.query(
      `UPDATE dm_messages SET read = TRUE
       WHERE receiver_id = $1 AND sender_id = $2 AND read = FALSE`,
      [me, other]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/dm/:userId  — send a direct message
router.post('/:userId', auth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content required' });
  const receiver = parseInt(req.params.userId, 10);
  try {
    // Verify receiver exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [receiver]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const result = await pool.query(
      `INSERT INTO dm_messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, receiver, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
