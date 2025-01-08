// Posts routes

import express from 'express';
import Post from '../models/Post.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const post = await Post.findOne({ 
            slug: req.params.slug,
            isPublished: true 
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected routes
router.post('/', adminAuth, async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
            isPublished: req.body.isPublished || false
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:slug', adminAuth, async (req, res) => {
    try {
        const post = await Post.findOneAndUpdate(
            { slug: req.params.slug },
            {
                title: req.body.title,
                content: req.body.content,
                isPublished: req.body.isPublished,
                ...(req.body.title && {
                    slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
                })
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:slug', adminAuth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ slug: req.params.slug });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 