// API routes

import express from 'express';
import PostController from '../controllers/postController.js';
import NewsletterController from '../controllers/NewsletterController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public API endpoints
router.get('/posts', PostController.apiListPosts);
router.get('/posts/:slug', PostController.apiGetPost);

// Protected API endpoints
router.use('/posts', adminAuth);
router.post('/posts', PostController.apiCreatePost);
router.put('/posts/:slug', PostController.apiUpdatePost);
router.delete('/posts/:slug', PostController.apiDeletePost);

// Newsletter endpoints
router.post('/newsletter/subscribe', NewsletterController.subscribe);
router.get('/newsletter/verify/:token', NewsletterController.verify);
router.get('/newsletter/unsubscribe', NewsletterController.unsubscribe);

export default router; 