const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/groups
router.get('/', auth, async (req, res) => {
  const { status, trail_id, search } = req.query;
  let query = `
    SELECT g.*, t.name AS trail_name, t.difficulty,
           u.name AS leader_name, u.profile_photo AS leader_photo
    FROM groups g
    LEFT JOIN trails t ON g.trail_id = t.id
    LEFT JOIN users u ON g.leader_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;
  if (status)   { query += ` AND g.status = $${idx++}`;                                             params.push(status); }
  if (trail_id) { query += ` AND g.trail_id = $${idx++}`;                                           params.push(trail_id); }
  if (search)   { query += ` AND (g.name ILIKE $${idx} OR t.name ILIKE $${idx++})`; params.push(`%${search}%`); }
  query += ' ORDER BY g.created_at DESC';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/groups/user/mygroups
router.get('/user/mygroups', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, t.name AS trail_name, t.difficulty, gm.role AS member_role
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       LEFT JOIN trails t ON g.trail_id = t.id
       WHERE gm.user_id = $1 AND gm.status = 'active'
       ORDER BY g.start_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/groups/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const groupRes = await pool.query(
      `SELECT g.*, t.name AS trail_name, t.difficulty, t.duration_days,
              u.name AS leader_name, u.profile_photo AS leader_photo
       FROM groups g
       LEFT JOIN trails t ON g.trail_id = t.id
       LEFT JOIN users u ON g.leader_id = u.id
       WHERE g.id = $1`,
      [req.params.id]
    );
    if (groupRes.rows.length === 0) return res.status(404).json({ message: 'Group not found' });

    const membersRes = await pool.query(
      `SELECT u.id, u.name, u.profile_photo, u.overall_rating, u.is_verified,
              gm.role AS member_role, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1 AND gm.status = 'active'
       ORDER BY gm.joined_at ASC`,
      [req.params.id]
    );
    res.json({ ...groupRes.rows[0], members: membersRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/groups — organizer or admin only
router.post('/', auth, requireRole('organizer', 'admin'), async (req, res) => {
  const { name, description, trail_id, trail_name, start_date, end_date, meeting_point, max_members, budget_estimate } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Trip name is required' });
  try {
    let resolvedTrailId = trail_id || null;
    if (!resolvedTrailId && trail_name) {
      const trailRes = await pool.query('SELECT id FROM trails WHERE LOWER(name) = LOWER($1)', [trail_name]);
      if (trailRes.rows.length > 0) resolvedTrailId = trailRes.rows[0].id;
    }
    // Normalise optional dates — empty strings become null
    const safeDate = (v) => (v && v.trim() ? v.trim() : null);
    const result = await pool.query(
      `INSERT INTO groups (name, description, trail_id, leader_id, start_date, end_date, meeting_point, max_members, budget_estimate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name.trim(), description || null, resolvedTrailId, req.user.id,
       safeDate(start_date), safeDate(end_date), meeting_point || null,
       max_members || 10, budget_estimate || null]
    );
    const group = result.rows[0];
    // Leader auto-joins as organizer
    await pool.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'organizer')`,
      [group.id, req.user.id]
    );
    res.status(201).json(group);
  } catch (err) {
    console.error('Group creation error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/groups/:id — leader or admin
router.put('/:id', auth, async (req, res) => {
  const group = await pool.query('SELECT leader_id FROM groups WHERE id = $1', [req.params.id]);
  if (group.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
  if (group.rows[0].leader_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { name, description, meeting_point, max_members, budget_estimate, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE groups SET name=$1, description=$2, meeting_point=$3, max_members=$4,
       budget_estimate=$5, status=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
      [name, description, meeting_point, max_members, budget_estimate, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/groups/:id/join
router.post('/:id/join', auth, async (req, res) => {
  const { message } = req.body;
  const groupId = req.params.id;
  try {
    const groupRes = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    if (groupRes.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
    const group = groupRes.rows[0];
    if (group.current_members >= group.max_members) {
      return res.status(400).json({ message: 'Group is full' });
    }
    const existing = await pool.query(
      'SELECT id FROM join_requests WHERE group_id = $1 AND user_id = $2',
      [groupId, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Join request already sent' });
    }
    await pool.query(
      'INSERT INTO join_requests (group_id, user_id, message) VALUES ($1, $2, $3)',
      [groupId, req.user.id, message || null]
    );
    // Notify group leader
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'group', 'New Join Request', $2, $3)`,
      [group.leader_id, `${req.user.name} wants to join ${group.name}`, JSON.stringify({ group_id: groupId })]
    );
    res.json({ message: 'Join request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/groups/requests/:id — approve or reject
router.patch('/requests/:id', auth, async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const reqRes = await pool.query(
      `SELECT jr.*, g.leader_id, g.name AS group_name, g.max_members, g.current_members, g.id AS group_id
       FROM join_requests jr JOIN groups g ON jr.group_id = g.id WHERE jr.id = $1`,
      [req.params.id]
    );
    if (reqRes.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
    const jr = reqRes.rows[0];
    if (jr.leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await pool.query(
      'UPDATE join_requests SET status=$1, responded_at=NOW() WHERE id=$2',
      [status, req.params.id]
    );
    if (status === 'approved') {
      await pool.query(
        'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [jr.group_id, jr.user_id]
      );
      await pool.query(
        'UPDATE groups SET current_members = current_members + 1 WHERE id = $1',
        [jr.group_id]
      );
    }
    // Notify requester
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'group', $2, $3, $4)`,
      [jr.user_id,
       status === 'approved' ? 'Join Request Approved' : 'Join Request Rejected',
       `Your request to join ${jr.group_name} was ${status}`,
       JSON.stringify({ group_id: jr.group_id })]
    );
    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/groups/:id/requests — leader only
router.get('/:id/requests', auth, async (req, res) => {
  const groupRes = await pool.query('SELECT leader_id FROM groups WHERE id = $1', [req.params.id]);
  if (groupRes.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
  if (groupRes.rows[0].leader_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    const result = await pool.query(
      `SELECT jr.*, u.name, u.profile_photo, u.overall_rating, u.total_treks
       FROM join_requests jr JOIN users u ON jr.user_id = u.id
       WHERE jr.group_id = $1 AND jr.status = 'pending'
       ORDER BY jr.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/groups/:id/leave
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    await pool.query(
      'UPDATE groups SET current_members = GREATEST(current_members - 1, 0) WHERE id = $1',
      [req.params.id]
    );
    res.json({ message: 'Left group' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/groups/:id/photo
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    const groupCheck = await pool.query('SELECT leader_id FROM groups WHERE id = $1', [req.params.id]);
    if (groupCheck.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
    if (groupCheck.rows[0].leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the group leader can update the photo' });
    }
    
    await pool.query(
      `UPDATE groups SET group_photo = $1, updated_at = NOW() WHERE id = $2`,
      [photoUrl, req.params.id]
    );
    res.json({ group_photo: photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
