const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/checklist/:groupId
router.get('/:groupId', auth, async (req, res) => {
  try {
    let checklist = await pool.query(
      'SELECT * FROM checklists WHERE group_id = $1',
      [req.params.groupId]
    );
    if (checklist.rows.length === 0) {
      const created = await pool.query(
        'INSERT INTO checklists (group_id, created_by) VALUES ($1, $2) RETURNING *',
        [req.params.groupId, req.user.id]
      );
      checklist = { rows: [created.rows[0]] };
    }
    const items = await pool.query(
      `SELECT ci.*, u.name AS assigned_name
       FROM checklist_items ci
       LEFT JOIN users u ON ci.assigned_to = u.id
       WHERE ci.checklist_id = $1
       ORDER BY ci.category, ci.created_at`,
      [checklist.rows[0].id]
    );
    res.json({ checklist: checklist.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/checklist/:groupId
router.post('/:groupId', auth, async (req, res) => {
  const { item_name, category, assigned_to } = req.body;
  if (!item_name) return res.status(400).json({ message: 'Item name is required' });
  try {
    let checklist = await pool.query(
      'SELECT * FROM checklists WHERE group_id = $1',
      [req.params.groupId]
    );
    if (checklist.rows.length === 0) {
      const created = await pool.query(
        'INSERT INTO checklists (group_id, created_by) VALUES ($1, $2) RETURNING *',
        [req.params.groupId, req.user.id]
      );
      checklist = { rows: [created.rows[0]] };
    }
    const result = await pool.query(
      `INSERT INTO checklist_items (checklist_id, item_name, category, assigned_to)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [checklist.rows[0].id, item_name, category || 'General', assigned_to || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/checklist/items/:id
router.patch('/items/:id', auth, async (req, res) => {
  const { is_checked, assigned_to } = req.body;
  try {
    const result = await pool.query(
      'UPDATE checklist_items SET is_checked=$1, assigned_to=$2 WHERE id=$3 RETURNING *',
      [is_checked, assigned_to, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/checklist/items/:id
router.delete('/items/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM checklist_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
