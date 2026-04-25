const pool = require('../db/pool');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ── Group Chat ────────────────────────────────────────────────────
    socket.on('join_group', ({ groupId, userId }) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${userId} joined group room: group_${groupId}`);
    });

    socket.on('leave_group', ({ groupId }) => {
      socket.leave(`group_${groupId}`);
    });

    socket.on('send_message', async ({ groupId, senderId, content, senderName, senderPhoto }) => {
      try {
        const result = await pool.query(
          `INSERT INTO messages (group_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
          [groupId, senderId, content]
        );
        const message = {
          ...result.rows[0],
          sender_name: senderName,
          sender_photo: senderPhoto,
        };
        io.to(`group_${groupId}`).emit('new_message', message);
      } catch (err) {
        console.error('Socket message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ groupId, userName }) => {
      socket.to(`group_${groupId}`).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('user_stop_typing');
    });

    // ── Direct Messages ───────────────────────────────────────────────
    socket.on('join_dm', ({ myUserId }) => {
      socket.join(`user_${myUserId}`);
      console.log(`User ${myUserId} joined DM room: user_${myUserId}`);
    });

    socket.on('send_dm', async ({ senderId, receiverId, content, senderName, senderPhoto }) => {
      try {
        const result = await pool.query(
          `INSERT INTO dm_messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
          [senderId, receiverId, content]
        );
        const message = {
          ...result.rows[0],
          sender_name: senderName,
          sender_photo: senderPhoto,
        };
        // Emit to both sender and receiver rooms
        io.to(`user_${receiverId}`).emit('new_dm', message);
        io.to(`user_${senderId}`).emit('new_dm', message);
      } catch (err) {
        console.error('Socket DM error:', err);
        socket.emit('error', { message: 'Failed to send DM' });
      }
    });

    socket.on('dm_typing', ({ receiverId, userName }) => {
      io.to(`user_${receiverId}`).emit('dm_user_typing', { userName });
    });

    socket.on('dm_stop_typing', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('dm_user_stop_typing');
    });

    // ── Trip Location Sharing ─────────────────────────────────────────
    socket.on('join_trip', ({ tripId, userId }) => {
      socket.join(`trip_${tripId}`);
      console.log(`User ${userId} joined trip room: trip_${tripId}`);
    });

    socket.on('leave_trip', ({ tripId }) => {
      socket.leave(`trip_${tripId}`);
    });

    socket.on('share_location', async ({ tripId, userId, lat, lng, userName }) => {
      try {
        // Persist to DB
        await pool.query(
          `UPDATE trip_participants SET last_lat = $1, last_lng = $2, last_location_at = NOW()
           WHERE trip_id = $3 AND user_id = $4 AND share_location = TRUE`,
          [lat, lng, tripId, userId]
        );
        // Broadcast to trip participants
        socket.to(`trip_${tripId}`).emit('location_update', {
          userId, userName, lat, lng, timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Location share error:', err);
      }
    });

    socket.on('stop_sharing', ({ tripId, userId }) => {
      socket.to(`trip_${tripId}`).emit('location_stopped', { userId });
    });

    // ── Notifications ─────────────────────────────────────────────────
    socket.on('join_notifications', ({ userId }) => {
      socket.join(`notif_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
