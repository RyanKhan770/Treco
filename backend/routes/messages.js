const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:groupId
router.get('/:groupId', auth, async (req, res) => {
  try {
    // Check membership
    const member = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.groupId, req.user.id]
    );
    if (member.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not a group member' });
    }
    const result = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.profile_photo AS sender_photo
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.group_id = $1
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [req.params.groupId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages/:groupId
router.post('/:groupId', auth, async (req, res) => {
  const { content, message_type } = req.body;
  if (!content) return res.status(400).json({ message: 'Content is required' });
  try {
    const member = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.groupId, req.user.id]
    );
    if (member.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not a group member' });
    }
    const result = await pool.query(
      `INSERT INTO messages (group_id, sender_id, content, message_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.groupId, req.user.id, content, message_type || 'text']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
