const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

// @route   GET /api/sos/contacts
// @desc    Get user's emergency contacts
// @access  Private
router.get('/contacts', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching contacts' });
  }
});

// @route   POST /api/sos/contacts
// @desc    Add an emergency contact
// @access  Private
router.post('/contacts', auth, async (req, res) => {
  try {
    const { name, phone_number, relation } = req.body;
    if (!name || !phone_number) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }

    const result = await pool.query(
      `INSERT INTO emergency_contacts (user_id, name, phone_number, relation)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name, phone_number, relation || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding contact' });
  }
});

// @route   DELETE /api/sos/contacts/:id
// @desc    Delete an emergency contact
// @access  Private
router.delete('/contacts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    res.json({ message: 'Contact removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting contact' });
  }
});

// @route   POST /api/sos/trigger
// @desc    Trigger an SOS alert
// @access  Private
router.post('/trigger', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Log the active SOS in the database
    const alertResult = await pool.query(
      `INSERT INTO sos_alerts (user_id, last_latitude, last_longitude, status)
       VALUES ($1, $2, $3, 'active') RETURNING *`,
      [req.user.id, latitude, longitude]
    );

    // Get the user's emergency contacts
    const contactsResult = await pool.query(
      `SELECT * FROM emergency_contacts WHERE user_id = $1`,
      [req.user.id]
    );
    
    const userResult = await pool.query(`SELECT name FROM users WHERE id = $1`, [req.user.id]);
    const userName = userResult.rows[0]?.name || 'A user';

    // SIMULATE SENDING SMS via Twilio
    console.log(`\n\n======================================================`);
    console.log(`🚨 SOS ALERT TRIGGERED BY ${userName} 🚨`);
    console.log(`Location: Lat ${latitude}, Lng ${longitude}`);
    console.log(`Google Maps: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    console.log(`Sending simulated SMS to ${contactsResult.rows.length} contacts...`);
    
    contactsResult.rows.forEach(contact => {
      console.log(`-> SMS to ${contact.name} (${contact.phone_number}): "${userName} triggered an SOS! Location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}"`);
    });
    console.log(`======================================================\n\n`);

    // In a real app, you would emit a WebSocket event to the Admin dashboard here.
    // e.g. io.emit('sos_alert', alertResult.rows[0]);

    res.status(201).json({ 
      message: 'SOS triggered and contacts alerted.',
      alert: alertResult.rows[0],
      contactsAlerted: contactsResult.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error triggering SOS' });
  }
});

// @route   GET /api/sos/alerts
// @desc    Get all active SOS alerts (Admin only)
// @access  Private Admin
router.get('/alerts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await pool.query(
      `SELECT s.*, u.name as user_name, u.profile_photo 
       FROM sos_alerts s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.status = 'active'
       ORDER BY s.triggered_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
});

// @route   PUT /api/sos/alerts/:id/resolve
// @desc    Resolve an SOS alert (Admin only)
// @access  Private Admin
router.put('/alerts/:id/resolve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const result = await pool.query(
      `UPDATE sos_alerts SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error resolving alert' });
  }
});

module.exports = router;
