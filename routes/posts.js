// Posts routes

import express from 'express';
import PostController from '../controllers/postController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/', PostController.listPublishedJson);
router.get('/:slug', PostController.getPostJson);

// Protected routes
router.post('/', adminAuth, PostController.createPost);

export default router; 