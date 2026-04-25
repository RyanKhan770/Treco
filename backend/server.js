require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const trailsRoutes = require('./routes/trails');
const groupsRoutes = require('./routes/groups');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');
const checklistRoutes = require('./routes/checklist');
const reviewsRoutes = require('./routes/reviews');
const notificationsRoutes = require('./routes/notifications');
const organizerRoutes = require('./routes/organizer');
const reportsRoutes = require('./routes/reports');
const adminRoutes  = require('./routes/admin');
const dmRoutes     = require('./routes/dm');
const budgetRoutes = require('./routes/budget');
const connectionsRoutes = require('./routes/connections');
const savedTrailsRoutes = require('./routes/savedTrails');
const tripsRoutes = require('./routes/trips');
const settingsRoutes = require('./routes/settings');
const { initSocket } = require('./socket/chatSocket');
const pool = require('./db/pool');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trails', trailsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dm',     dmRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/saved-trails', savedTrailsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/posts', require('./routes/posts'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Treco API' }));

// Socket.io
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Treco API running on port ${PORT}`);
  // Test DB connection on startup
  try {
    await pool.query('SELECT 1');
    console.log('✓ PostgreSQL connected');
  } catch (err) {
    console.error('✗ PostgreSQL connection failed:', err.message);
  }
});
