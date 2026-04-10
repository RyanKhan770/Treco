const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const adminOnly = [auth, requireRole('admin')];

// GET /api/admin/stats — dashboard overview
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [users, trails, groups, reports, pendingOrganizers] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM trails WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM groups'),
      pool.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM organizer_requests WHERE status = 'pending'"),
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalTrails: parseInt(trails.rows[0].count),
      totalGroups: parseInt(groups.rows[0].count),
      pendingReports: parseInt(reports.rows[0].count),
      pendingOrganizerRequests: parseInt(pendingOrganizers.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, is_verified, verification_status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', ...adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'organizer', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/verify
router.patch('/users/:id/verify', ...adminOnly, async (req, res) => {
  const { status } = req.body; // 'verified' | 'rejected'
  try {
    await pool.query(
      'UPDATE users SET is_verified=$1, verification_status=$2 WHERE id=$3',
      [status === 'verified', status, req.params.id]
    );
    res.json({ message: `User verification ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
