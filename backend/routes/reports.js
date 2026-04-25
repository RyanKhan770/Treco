const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// POST /api/reports
router.post('/', auth, async (req, res) => {
  const { reported_user_id, group_id, reason, description } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason is required' });
  try {
    // Prevent reporting admins/organizers
    if (reported_user_id) {
      const target = await pool.query('SELECT role FROM users WHERE id = $1', [reported_user_id]);
      if (target.rows.length > 0 && ['admin', 'organizer'].includes(target.rows[0].role)) {
        return res.status(403).json({ message: 'Cannot report admin or organizer users. Contact support instead.' });
      }
    }
    const result = await pool.query(
      `INSERT INTO reports (reporter_id, reported_user_id, group_id, reason, description)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, reported_user_id || null, group_id || null, reason, description]
    );
    res.status(201).json({ message: 'Report submitted', report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports — admin only
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*,
              reporter.name AS reporter_name,
              reported.name AS reported_name
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       LEFT JOIN users reported ON r.reported_user_id = reported.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/reports/:id — admin only
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reports SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
