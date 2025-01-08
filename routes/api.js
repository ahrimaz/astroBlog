// API routes

import express from 'express';
import Post from '../models/Post.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Debug route
router.get('/debug/posts', adminAuth, async (req, res) => {
    try {
        const posts = await Post.find({});
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create post
router.post('/posts', adminAuth, async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
            isPublished: req.body.isPublished || false
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 