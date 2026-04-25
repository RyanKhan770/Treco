const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/budget/:groupId
router.get('/:groupId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM budget_items WHERE group_id = $1 ORDER BY created_at ASC',
      [req.params.groupId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/budget/:groupId
router.post('/:groupId', auth, async (req, res) => {
  const { category, description, amount, color } = req.body;
  if (!category || amount == null)
    return res.status(400).json({ message: 'Category and amount are required' });
  try {
    const result = await pool.query(
      `INSERT INTO budget_items (group_id, category, description, amount, color, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.groupId, category, description || null, amount, color || '#40916C', req.user.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/budget/:groupId/:itemId
router.delete('/:groupId/:itemId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM budget_items WHERE id=$1 AND group_id=$2',
      [req.params.itemId, req.params.groupId],
    );
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
