const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const adminOnly = [auth, requireRole('admin')];

// GET /api/admin/stats — dashboard overview
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [users, trails, groups, reports, pendingOrganizers, pendingVerifications] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM trails WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM groups'),
      pool.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM organizer_requests WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM users WHERE verification_status = 'pending'"),
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalTrails: parseInt(trails.rows[0].count),
      totalGroups: parseInt(groups.rows[0].count),
      pendingReports: parseInt(reports.rows[0].count),
      pendingOrganizerRequests: parseInt(pendingOrganizers.rows[0].count),
      pendingVerifications: parseInt(pendingVerifications.rows[0].count),
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
      'SELECT id, name, email, phone, role, is_verified, verification_status, government_id_url, created_at FROM users ORDER BY created_at DESC'
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

// PATCH /api/admin/users/:id/ban — suspend or unban a user
router.patch('/users/:id/ban', ...adminOnly, async (req, res) => {
  const { banned } = req.body; // true = ban, false = unban
  const newRole = banned ? 'banned' : 'user';
  try {
    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role',
      [newRole, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
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

// GET /api/admin/groups — all groups with leader & trail info
router.get('/groups', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, t.name AS trail_name, u.name AS leader_name
      FROM groups g
      LEFT JOIN trails t ON g.trail_id = t.id
      LEFT JOIN users u ON g.leader_id = u.id
      ORDER BY g.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/groups/:id/close — set status to closed
router.patch('/groups/:id/close', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE groups SET status='closed', updated_at=NOW() WHERE id=$1 RETURNING id, name, status",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/groups/:id — permanently delete group
router.delete('/groups/:id', ...adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM groups WHERE id = $1', [req.params.id]);
    res.json({ message: 'Group deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/analytics — chart data for dashboard
router.get('/analytics', ...adminOnly, async (req, res) => {
  try {
    // User registrations per month (last 12 months)
    const userGrowth = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
             COUNT(*) AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    // Popular trails (top 10 by group count)
    const popularTrails = await pool.query(`
      SELECT t.name, COUNT(g.id) AS group_count
      FROM trails t
      LEFT JOIN groups g ON g.trail_id = t.id
      WHERE t.is_active = TRUE
      GROUP BY t.id, t.name
      ORDER BY group_count DESC
      LIMIT 10
    `);

    // Solo vs group: users in groups vs not
    const soloVsGroup = await pool.query(`
      SELECT
        (SELECT COUNT(DISTINCT user_id) FROM group_members) AS group_users,
        (SELECT COUNT(*) FROM users WHERE role != 'admin') AS total_users
    `);

    // Reports by status
    const reportsByStatus = await pool.query(`
      SELECT status, COUNT(*) AS count FROM reports GROUP BY status
    `);

    // Verification rate
    const verificationRate = await pool.query(`
      SELECT verification_status, COUNT(*) AS count
      FROM users WHERE verification_status IS NOT NULL AND verification_status != 'none'
      GROUP BY verification_status
    `);

    // Users by role
    const usersByRole = await pool.query(`
      SELECT role, COUNT(*) AS count FROM users GROUP BY role
    `);

    // Active groups by month
    const groupGrowth = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
             COUNT(*) AS count
      FROM groups
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    res.json({
      userGrowth: userGrowth.rows,
      popularTrails: popularTrails.rows,
      soloVsGroup: {
        group: parseInt(soloVsGroup.rows[0]?.group_users || 0),
        solo: parseInt(soloVsGroup.rows[0]?.total_users || 0) - parseInt(soloVsGroup.rows[0]?.group_users || 0),
      },
      reportsByStatus: reportsByStatus.rows,
      verificationRate: verificationRate.rows,
      usersByRole: usersByRole.rows,
      groupGrowth: groupGrowth.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id — detailed user info including gov ID
router.get('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, name, email, phone, role, bio, location, profile_photo, government_id_url,
              is_verified, verification_status, overall_rating, total_treks, total_reviews,
              experience_level, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    // Get user's reports
    const reports = await pool.query(
      `SELECT r.*, reporter.name AS reporter_name FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       WHERE r.reported_user_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...user.rows[0], reports: reports.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
