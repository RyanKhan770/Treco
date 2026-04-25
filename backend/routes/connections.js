const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/connections/request — send a friend/connection request
router.post('/request', auth, async (req, res) => {
  const { receiverId } = req.body;
  if (!receiverId) return res.status(400).json({ message: 'receiverId is required' });
  if (receiverId === req.user.id) return res.status(400).json({ message: 'Cannot connect with yourself' });
  try {
    // Check if connection already exists in either direction
    const existing = await pool.query(
      `SELECT id, status FROM connections
       WHERE (requester_id = $1 AND receiver_id = $2)
          OR (requester_id = $2 AND receiver_id = $1)`,
      [req.user.id, receiverId]
    );
    if (existing.rows.length > 0) {
      const conn = existing.rows[0];
      if (conn.status === 'accepted') return res.status(409).json({ message: 'Already connected' });
      if (conn.status === 'pending') return res.status(409).json({ message: 'Request already pending' });
      if (conn.status === 'rejected') {
        // Allow re-requesting after rejection
        await pool.query(
          `UPDATE connections SET status = 'pending', requester_id = $1, receiver_id = $2, updated_at = NOW() WHERE id = $3`,
          [req.user.id, receiverId, conn.id]
        );
        return res.json({ message: 'Connection request re-sent' });
      }
    }
    const connResult = await pool.query(
      `INSERT INTO connections (requester_id, receiver_id) VALUES ($1, $2) RETURNING id`,
      [req.user.id, receiverId]
    );
    const connectionId = connResult.rows[0].id;
    // Notify the receiver
    const sender = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'connection', 'New Connection Request', $2, $3)`,
      [receiverId, `${sender.rows[0]?.name || 'Someone'} wants to connect with you`, JSON.stringify({ from_user_id: req.user.id, connection_id: connectionId })]
    );
    res.status(201).json({ message: 'Connection request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/connections/requests — pending requests FOR the current user
router.get('/requests', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.requester_id, c.created_at,
              u.name, u.profile_photo, u.bio, u.is_verified, u.overall_rating,
              u.total_treks, u.experience_level, u.location, u.role
       FROM connections c
       JOIN users u ON u.id = c.requester_id
       WHERE c.receiver_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/connections/sent — pending requests SENT by the current user
router.get('/sent', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.receiver_id, c.status, c.created_at,
              u.name, u.profile_photo, u.is_verified, u.role
       FROM connections c
       JOIN users u ON u.id = c.receiver_id
       WHERE c.requester_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/connections/:id — accept or reject a connection request
router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body; // 'accepted' | 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be accepted or rejected' });
  }
  try {
    const conn = await pool.query(
      'SELECT * FROM connections WHERE id = $1 AND receiver_id = $2 AND status = $3',
      [req.params.id, req.user.id, 'pending']
    );
    if (conn.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    await pool.query(
      'UPDATE connections SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, req.params.id]
    );
    // Notify the requester
    const receiverName = req.user.name;
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'connection', $2, $3, $4)`,
      [conn.rows[0].requester_id,
       status === 'accepted' ? 'Connection Accepted!' : 'Connection Declined',
       status === 'accepted' ? `${receiverName} accepted your connection request` : `${receiverName} declined your connection request`,
       JSON.stringify({ from_user_id: req.user.id })]
    );
    res.json({ message: `Connection ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/connections — list all accepted connections for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id AS connection_id,
              CASE WHEN c.requester_id = $1 THEN c.receiver_id ELSE c.requester_id END AS user_id,
              u.name, u.profile_photo, u.bio, u.is_verified, u.overall_rating,
              u.total_treks, u.experience_level, u.location, u.role,
              c.created_at AS connected_since
       FROM connections c
       JOIN users u ON u.id = CASE WHEN c.requester_id = $1 THEN c.receiver_id ELSE c.requester_id END
       WHERE (c.requester_id = $1 OR c.receiver_id = $1) AND c.status = 'accepted'
       ORDER BY u.name ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/connections/status/:userId — check connection status with a specific user
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, requester_id, receiver_id
       FROM connections
       WHERE (requester_id = $1 AND receiver_id = $2)
          OR (requester_id = $2 AND receiver_id = $1)
       LIMIT 1`,
      [req.user.id, req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.json({ status: 'none', connectionId: null });
    }
    const conn = result.rows[0];
    const isSender = conn.requester_id === req.user.id;
    res.json({
      status: conn.status,
      connectionId: conn.id,
      direction: isSender ? 'sent' : 'received',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/connections/:id — remove a connection
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM connections WHERE id = $1 AND (requester_id = $2 OR receiver_id = $2)',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Connection removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
