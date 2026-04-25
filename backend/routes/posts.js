const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { content, trail_id } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, trail_id, content, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, trail_id || null, content, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// @route   GET /api/posts/feed
// @desc    Get all posts for the activity feed
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.profile_photo as user_avatar, u.role as user_role, t.name as trail_name,
              EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN trails t ON p.trail_id = t.id
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching feed' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    // Check if liked
    const check = await pool.query('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    let liked = false;
    
    if (check.rows.length > 0) {
      // Unlike
      await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      await pool.query('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [req.params.id]);
    } else {
      // Like
      await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [req.params.id, req.user.id]);
      await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [req.params.id]);
      liked = true;
    }
    
    // Get updated post
    const updated = await pool.query('SELECT likes_count FROM posts WHERE id = $1', [req.params.id]);
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    
    res.json({ is_liked: liked, likes_count: updated.rows[0].likes_count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a post
// @access  Private
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pc.*, u.name as user_name, u.profile_photo as user_avatar
       FROM post_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.post_id = $1
       ORDER BY pc.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const result = await pool.query(
      `INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.user.id, content]
    );
    
    // Increment post comment count
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [req.params.id]);

    const comment = result.rows[0];
    // Attach user info to return
    comment.user_name = req.user.name;
    comment.user_avatar = req.user.profile_photo;
    
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get all posts by a specific user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.profile_photo as user_avatar, u.role as user_role, t.name as trail_name,
              EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN trails t ON p.trail_id = t.id
       WHERE p.user_id = $2
       ORDER BY p.created_at DESC`,
      [req.user.id, userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user posts' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const check = await pool.query('SELECT user_id FROM posts WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (check.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const result = await pool.query(
      'UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const check = await pool.query('SELECT user_id FROM posts WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    if (check.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

module.exports = router;
