const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// @route   POST /api/tracks
// @desc    Save a recorded track
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, coordinates, distance_km, duration_minutes } = req.body;
    
    // Calculate simple distance or default
    const dist = distance_km || 0;
    const dur = duration_minutes || 0;

    const result = await pool.query(
      `INSERT INTO recorded_tracks (user_id, name, coordinates, distance_km, duration_minutes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name || 'Afternoon Trek', JSON.stringify(coordinates || []), dist, dur]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving track' });
  }
});

// @route   GET /api/tracks/me
// @desc    Get user's track history
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM recorded_tracks WHERE user_id = $1 ORDER BY recorded_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tracks' });
  }
});

module.exports = router;
