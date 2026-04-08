const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/trails
router.get('/', async (req, res) => {
  const { difficulty, region, search } = req.query;
  let query = 'SELECT * FROM trails WHERE is_active = TRUE';
  const params = [];
  let idx = 1;

  if (difficulty && difficulty !== 'All') {
    query += ` AND difficulty = $${idx++}`;
    params.push(difficulty.toLowerCase());
  }
  if (region) {
    query += ` AND region ILIKE $${idx++}`;
    params.push(`%${region}%`);
  }
  if (search) {
    query += ` AND (name ILIKE $${idx++} OR location_name ILIKE $${idx - 1})`;
    params.push(`%${search}%`);
  }
  query += ' ORDER BY name ASC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/trails/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trails WHERE id = $1 AND is_active = TRUE', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Trail not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/trails — organizer or admin only
router.post('/', auth, requireRole('organizer', 'admin'), async (req, res) => {
  const {
    name, description, difficulty, distance_km, duration_days,
    elevation_gain_m, max_altitude_m, location_name, region,
    latitude, longitude, permit_required, best_season, tea_houses_available,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trails (name, description, difficulty, distance_km, duration_days,
        elevation_gain_m, max_altitude_m, location_name, region, latitude, longitude,
        permit_required, best_season, tea_houses_available, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [name, description, difficulty, distance_km, duration_days, elevation_gain_m,
       max_altitude_m, location_name, region, latitude, longitude,
       permit_required || false, best_season, tea_houses_available || false, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/trails/:id — admin only
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  const fields = req.body;
  const setClause = Object.keys(fields)
    .map((key, i) => `${key} = $${i + 2}`)
    .join(', ');
  try {
    const result = await pool.query(
      `UPDATE trails SET ${setClause} WHERE id = $1 RETURNING *`,
      [req.params.id, ...Object.values(fields)]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Trail not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/trails/:id — admin only
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('UPDATE trails SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Trail deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
