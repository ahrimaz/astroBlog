// Admin routes

import express from 'express';
import Post from '../models/Post.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to delete a file
async function deleteFile(filepath) {
    try {
        const relativePath = filepath.replace(/^\/uploads\//, '');
        const absolutePath = path.join(__dirname, '../public/uploads', relativePath);
        await fs.unlink(absolutePath);
        console.log(`Successfully deleted file: ${filepath}`);
    } catch (error) {
        console.error(`Error deleting file ${filepath}:`, error);
    }
}

// Authentication routes (unprotected)
router.get('/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { title: 'Admin Login' });
});

router.post('/login', (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.status(401).render('admin/login', { 
            title: 'Admin Login',
            error: 'Invalid password'
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Auth middleware to protect routes
router.use(adminAuth);

// Protected admin routes
router.get('/dashboard', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 });
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            posts: posts
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: error.message
        });
    }
});

router.get('/posts/new', (req, res) => {
    res.render('admin/new-post', { title: 'New Post' });
});

router.post('/posts', adminAuth, async (req, res) => {
    try {
        console.log('Received post data:', req.body); 
        
        
        const images = req.body.images ? req.body.images.split(',') : [];
        console.log('Processed images:', images); 

        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
            isPublished: req.body.isPublished === 'on',
            images: images
        });

        console.log('Created post object:', post);
        await post.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: error.message
        });
    }
});

router.get('/posts/:id/edit', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Post not found'
            });
        }
        res.render('admin/edit-post', { 
            title: 'Edit Post',
            post: post 
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: error.message
        });
    }
});

router.post('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                content: req.body.content,
                slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
                isPublished: req.body.isPublished === 'on'
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Post not found'
            });
        }

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: error.message
        });
    }
});

router.delete('/posts/:id', adminAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete associated images if they exist
        if (post.images && post.images.length > 0) {
            for (const imageUrl of post.images) {
                await deleteFile(imageUrl);
            }
        }

        // Delete the post
        await Post.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Post and associated images deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the URL of the uploaded file
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
