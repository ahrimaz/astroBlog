import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

// Main blog listing
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true })
            .sort({ createdAt: -1 });
        
        res.render('public/index', { 
            title: 'Blog Posts',
            posts: posts,
            isAdmin: req.session.isAdmin
        });
    } catch (error) {
        res.status(500).render('error', { 
            title: 'Error',
            message: error.message 
        });
    }
});

// Single post view
router.get('/posts/:slug', async (req, res) => {
    try {
        const post = await Post.findOne({ 
            slug: req.params.slug,
            isPublished: true 
        });

        if (!post) {
            return res.status(404).render('error', {
                title: 'Not Found',
                message: 'Post not found'
            });
        }

        res.render('public/post', {
            title: post.title,
            post: post
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: error.message
        });
    }
});

export default router;
