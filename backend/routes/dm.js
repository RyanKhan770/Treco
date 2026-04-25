/**
 * Direct Messages — /api/dm
 *
 * DMs between users. Connected users see messages normally.
 * Non-connected users can still send messages but they appear as "message requests".
 */

const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: check if two users are connected
async function areConnected(userA, userB) {
  const result = await pool.query(
    `SELECT id FROM connections
     WHERE ((requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1))
       AND status = 'accepted'`,
    [userA, userB]
  );
  return result.rows.length > 0;
}

// GET /api/dm/inbox — list of recent DM conversations for the current user
router.get('/inbox', auth, async (req, res) => {
  try {
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

    // Add connection status for each conversation
    const enriched = await Promise.all(result.rows.map(async (row) => {
      const connected = await areConnected(req.user.id, row.partner_id);
      return { ...row, is_connected: connected };
    }));

    // Sort by most recent message
    enriched.sort((a, b) => new Date(b.last_at) - new Date(a.last_at));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dm/:userId — get conversation history with a specific user
router.get('/:userId', auth, async (req, res) => {
  const other = req.params.userId;
  const me = req.user.id;
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

// POST /api/dm/:userId — send a direct message
router.post('/:userId', auth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content required' });
  const receiver = req.params.userId;
  try {
    // Verify receiver exists
    const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [receiver]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const result = await pool.query(
      `INSERT INTO dm_messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, receiver, content.trim()]
    );

    // Create notification for receiver
    const senderName = req.user.name;
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'message', 'New Message', $2, $3)`,
      [receiver, `${senderName}: ${content.trim().substring(0, 50)}`, JSON.stringify({ from_user_id: req.user.id })]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
