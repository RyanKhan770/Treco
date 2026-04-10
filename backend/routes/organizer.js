const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// POST /api/organizer/request
router.post('/request', auth, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(400).json({ message: 'Only regular users can request organizer status' });
  }
  const { reason, experience, previous_treks } = req.body;
  try {
    const existing = await pool.query(
      'SELECT id FROM organizer_requests WHERE user_id = $1 AND status = $2',
      [req.user.id, 'pending']
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'You already have a pending request' });
    }
    const result = await pool.query(
      `INSERT INTO organizer_requests (user_id, reason, experience, previous_treks)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, reason, experience, previous_treks || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/organizer/requests — admin only
router.get('/requests', auth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orq.*, u.name, u.email, u.total_treks, u.profile_photo
       FROM organizer_requests orq
       JOIN users u ON orq.user_id = u.id
       WHERE orq.status = 'pending'
       ORDER BY orq.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/organizer/requests/:id — admin only
router.patch('/requests/:id', auth, requireRole('admin'), async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const reqRes = await pool.query(
      'SELECT user_id FROM organizer_requests WHERE id = $1',
      [req.params.id]
    );
    if (reqRes.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    await pool.query(
      'UPDATE organizer_requests SET status=$1, reviewed_by=$2, reviewed_at=NOW() WHERE id=$3',
      [status, req.user.id, req.params.id]
    );

    if (status === 'approved') {
      await pool.query(
        'UPDATE users SET role=$1, organizer_approved_at=NOW(), organizer_approved_by=$2 WHERE id=$3',
        ['organizer', req.user.id, reqRes.rows[0].user_id]
      );
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body)
       VALUES ($1, 'group', $2, $3)`,
      [reqRes.rows[0].user_id,
       status === 'approved' ? 'Organizer Status Approved!' : 'Organizer Request Rejected',
       status === 'approved'
         ? 'You can now create and manage group treks on Treco!'
         : 'Your organizer request was not approved at this time.']
    );

    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
