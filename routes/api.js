// API routes

import express from 'express';
import PostController from '../controllers/postController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public API endpoints
router.get('/posts', PostController.apiListPosts);
router.get('/posts/:slug', PostController.apiGetPost);

// Protected API endpoints
router.post('/posts', adminAuth, PostController.apiCreatePost);
router.put('/posts/:slug', adminAuth, PostController.apiUpdatePost);
router.delete('/posts/:slug', adminAuth, PostController.apiDeletePost);

// Debug endpoint
router.get('/debug/posts', adminAuth, PostController.apiDebugListAllPosts);

export default router; 