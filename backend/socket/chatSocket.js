const pool = require('../db/pool');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a group chat room
    socket.on('join_group', ({ groupId, userId }) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${userId} joined group room: group_${groupId}`);
    });

    // Leave a group chat room
    socket.on('leave_group', ({ groupId }) => {
      socket.leave(`group_${groupId}`);
    });

    // Send a message
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
        // Broadcast to all in the group room
        io.to(`group_${groupId}`).emit('new_message', message);
      } catch (err) {
        console.error('Socket message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ groupId, userName }) => {
      socket.to(`group_${groupId}`).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
