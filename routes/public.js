// Public routes

import express from 'express';
import PostController from '../controllers/postController.js';

const router = express.Router();

router.get('/', PostController.listPublished);
router.get('/posts/:slug', PostController.showPost);

export default router;
