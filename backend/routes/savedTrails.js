const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/saved-trails/:trailId — save a trail
router.post('/:trailId', auth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO saved_trails (user_id, trail_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.trailId]
    );
    res.status(201).json({ message: 'Trail saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/saved-trails/:trailId — unsave a trail
router.delete('/:trailId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM saved_trails WHERE user_id = $1 AND trail_id = $2',
      [req.user.id, req.params.trailId]
    );
    res.json({ message: 'Trail unsaved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/saved-trails — get all saved trails for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, st.saved_at
       FROM saved_trails st
       JOIN trails t ON t.id = st.trail_id
       WHERE st.user_id = $1 AND t.is_active = TRUE
       ORDER BY st.saved_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/saved-trails/check/:trailId — check if a trail is saved
router.get('/check/:trailId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT 1 FROM saved_trails WHERE user_id = $1 AND trail_id = $2',
      [req.user.id, req.params.trailId]
    );
    res.json({ saved: result.rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
