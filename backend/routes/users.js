const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, location, profile_photo, bio, is_verified,
              verification_status, overall_rating, total_treks, total_groups, total_reviews,
              experience_level, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  const { name, phone, bio, location, experience_level } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, phone=$2, bio=$3, location=$4, experience_level=$5, updated_at=NOW()
       WHERE id=$6
       RETURNING id, name, email, phone, bio, location, experience_level, profile_photo, role`,
      [name, phone, bio, location, experience_level, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/me/photo
router.post('/me/photo', auth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query('UPDATE users SET profile_photo = $1 WHERE id = $2', [photoUrl, req.user.id]);
    res.json({ profile_photo: photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
