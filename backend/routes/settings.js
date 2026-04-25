const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — get current user's settings
router.get('/', auth, async (req, res) => {
  try {
    let result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      // Create default settings
      result = await pool.query(
        `INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *`,
        [req.user.id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings — update settings
router.put('/', auth, async (req, res) => {
  const { notifications_enabled, location_enabled, dark_mode } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, notifications_enabled, location_enabled, dark_mode)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET notifications_enabled = $2, location_enabled = $3, dark_mode = $4, updated_at = NOW()
       RETURNING *`,
      [req.user.id, notifications_enabled ?? true, location_enabled ?? true, dark_mode ?? false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
