// Admin routes

import express from 'express';
import PostController from '../controllers/postController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Add this BEFORE the adminAuth middleware
router.get('/login', (req, res) => {
    res.render('admin/login', { title: 'Admin Login' });
});

router.post('/login', (req, res) => {
    // Check credentials
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { 
            title: 'Admin Login',
            error: 'Invalid password'
        });
    }
});

// Protected routes below
router.use(adminAuth);

// Dashboard and post management
router.get('/dashboard', PostController.listAllPosts);
router.get('/posts/new', PostController.showNewPostForm);
router.post('/posts', PostController.createPost);
router.get('/posts/:id/edit', PostController.showEditForm);
router.put('/posts/:id', PostController.updatePost);
router.delete('/posts/:id', PostController.deletePost);

// Image handling
router.post('/upload', PostController.uploadMiddleware(), PostController.handleImageUpload);

export default router;
