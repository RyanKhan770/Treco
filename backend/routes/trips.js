const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/trips — create a trip
router.post('/', auth, async (req, res) => {
  const { name, description, trail_id, group_id, start_date, end_date, meeting_point, participants } = req.body;
  if (!name) return res.status(400).json({ message: 'Trip name is required' });
  try {
    const result = await pool.query(
      `INSERT INTO trips (name, description, trail_id, group_id, created_by, start_date, end_date, meeting_point)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, description || null, trail_id || null, group_id || null, req.user.id, start_date || null, end_date || null, meeting_point || null]
    );
    const trip = result.rows[0];
    // Creator auto-joins
    await pool.query(
      `INSERT INTO trip_participants (trip_id, user_id, status) VALUES ($1, $2, 'accepted')`,
      [trip.id, req.user.id]
    );
    // Invite participants if provided
    if (Array.isArray(participants) && participants.length > 0) {
      for (const userId of participants) {
        if (userId === req.user.id) continue;
        await pool.query(
          `INSERT INTO trip_participants (trip_id, user_id, status) VALUES ($1, $2, 'invited') ON CONFLICT DO NOTHING`,
          [trip.id, userId]
        );
        // Notify invited users
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, data)
           VALUES ($1, 'trip', 'Trip Invitation', $2, $3)`,
          [userId, `You've been invited to "${name}"`, JSON.stringify({ trip_id: trip.id })]
        );
      }
    }
    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/trips — get user's trips
router.get('/', auth, async (req, res) => {
  const { status } = req.query; // planned, active, completed, cancelled
  try {
    let query = `
      SELECT t.*, tr.name AS trail_name, tr.difficulty, tr.cover_image,
             g.name AS group_name,
             tp.status AS participant_status,
             (SELECT COUNT(*) FROM trip_participants WHERE trip_id = t.id AND status = 'accepted') AS participant_count
      FROM trips t
      JOIN trip_participants tp ON t.id = tp.trip_id AND tp.user_id = $1
      LEFT JOIN trails tr ON t.trail_id = tr.id
      LEFT JOIN groups g ON t.group_id = g.id
      WHERE 1=1
    `;
    const params = [req.user.id];
    let idx = 2;
    if (status) {
      query += ` AND t.status = $${idx++}`;
      params.push(status);
    }
    query += ' ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/trips/:id — get trip detail with participants
router.get('/:id', auth, async (req, res) => {
  try {
    const tripRes = await pool.query(
      `SELECT t.*, tr.name AS trail_name, tr.difficulty, tr.latitude, tr.longitude, tr.geojson_path,
              g.name AS group_name, u.name AS creator_name
       FROM trips t
       LEFT JOIN trails tr ON t.trail_id = tr.id
       LEFT JOIN groups g ON t.group_id = g.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (tripRes.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });

    const participantsRes = await pool.query(
      `SELECT tp.*, u.name, u.profile_photo, u.is_verified,
              tp.share_location, tp.last_lat, tp.last_lng, tp.last_location_at
       FROM trip_participants tp
       JOIN users u ON tp.user_id = u.id
       WHERE tp.trip_id = $1
       ORDER BY tp.joined_at ASC`,
      [req.params.id]
    );
    res.json({ ...tripRes.rows[0], participants: participantsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/trips/:id — update trip
router.patch('/:id', auth, async (req, res) => {
  const { status, name, description, start_date, end_date, meeting_point } = req.body;
  try {
    const trip = await pool.query('SELECT created_by FROM trips WHERE id = $1', [req.params.id]);
    if (trip.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
    if (trip.rows[0].created_by !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const result = await pool.query(
      `UPDATE trips SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        meeting_point = COALESCE($6, meeting_point),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name, description, status, start_date, end_date, meeting_point, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/trips/:id/participants — add participant
router.post('/:id/participants', auth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId required' });
  try {
    await pool.query(
      `INSERT INTO trip_participants (trip_id, user_id, status) VALUES ($1, $2, 'invited') ON CONFLICT DO NOTHING`,
      [req.params.id, userId]
    );
    const trip = await pool.query('SELECT name FROM trips WHERE id = $1', [req.params.id]);
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, 'trip', 'Trip Invitation', $2, $3)`,
      [userId, `You've been invited to "${trip.rows[0]?.name}"`, JSON.stringify({ trip_id: req.params.id })]
    );
    res.json({ message: 'Participant invited' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/trips/:id/participants/:userId — accept invite, toggle location
router.patch('/:id/participants/:userId', auth, async (req, res) => {
  const { status, share_location } = req.body;
  try {
    const sets = [];
    const params = [];
    let idx = 1;
    if (status) { sets.push(`status = $${idx++}`); params.push(status); }
    if (share_location !== undefined) { sets.push(`share_location = $${idx++}`); params.push(share_location); }
    if (sets.length === 0) return res.status(400).json({ message: 'Nothing to update' });

    params.push(req.params.id, req.params.userId);
    await pool.query(
      `UPDATE trip_participants SET ${sets.join(', ')} WHERE trip_id = $${idx++} AND user_id = $${idx}`,
      params
    );
    res.json({ message: 'Participant updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/trips/:id/location — update live location
router.post('/:id/location', auth, async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ message: 'lat and lng required' });
  try {
    await pool.query(
      `UPDATE trip_participants SET last_lat = $1, last_lng = $2, last_location_at = NOW()
       WHERE trip_id = $3 AND user_id = $4 AND share_location = TRUE`,
      [lat, lng, req.params.id, req.user.id]
    );
    res.json({ message: 'Location updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
