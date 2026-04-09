const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/user/:id
router.get('/user/:id', auth, async (req, res) => {
  try {
    const reviews = await pool.query(
      `SELECT ur.*, u.name AS reviewer_name, u.profile_photo AS reviewer_photo,
              g.name AS group_name
       FROM user_reviews ur
       JOIN users u ON ur.reviewer_id = u.id
       LEFT JOIN groups g ON ur.group_id = g.id
       WHERE ur.reviewed_id = $1
       ORDER BY ur.created_at DESC`,
      [req.params.id]
    );
    const stats = await pool.query(
      `SELECT AVG(reliability) AS avg_reliability,
              AVG(cooperation) AS avg_cooperation,
              AVG(experience_skills) AS avg_experience,
              AVG(overall_rating) AS avg_overall,
              COUNT(*) AS total
       FROM user_reviews WHERE reviewed_id = $1`,
      [req.params.id]
    );
    res.json({ reviews: reviews.rows, stats: stats.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews/user
router.post('/user', auth, async (req, res) => {
  const { reviewed_id, group_id, reliability, cooperation, experience_skills, comment } = req.body;
  if (!reviewed_id || !reliability || !cooperation || !experience_skills) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const overall = ((reliability + cooperation + experience_skills) / 3).toFixed(2);
  try {
    const result = await pool.query(
      `INSERT INTO user_reviews (reviewer_id, reviewed_id, group_id, reliability, cooperation, experience_skills, overall_rating, comment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, reviewed_id, group_id || null, reliability, cooperation, experience_skills, overall, comment]
    );
    // Update reviewed user's overall rating
    await pool.query(
      `UPDATE users SET overall_rating = (
         SELECT AVG(overall_rating) FROM user_reviews WHERE reviewed_id = $1
       ), total_reviews = total_reviews + 1 WHERE id = $1`,
      [reviewed_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Already reviewed this user for this trip' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
