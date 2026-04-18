const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/users/organizers — browse verified organizers for Connect tab
// Must be defined BEFORE /:id to avoid 'organizers' being caught as an id param
router.get('/organizers', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, profile_photo, bio, overall_rating, total_treks,
              total_groups, experience_level, location, is_verified
       FROM users
       WHERE role IN ('organizer', 'admin')
       ORDER BY overall_rating DESC NULLS LAST, total_treks DESC NULLS LAST
       LIMIT 30`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/browse — browse all trekkers (for connect with users)
router.get('/browse', auth, async (req, res) => {
  const { q } = req.query;
  try {
    let query = `
      SELECT id, name, profile_photo, bio, overall_rating, total_treks,
             experience_level, location, is_verified, role
      FROM users
      WHERE id != $1
    `;
    const params = [req.user.id];
    if (q) {
      query += ` AND (name ILIKE $2 OR location ILIKE $2)`;
      params.push(`%${q}%`);
    }
    query += ' ORDER BY overall_rating DESC NULLS LAST LIMIT 40';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

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
