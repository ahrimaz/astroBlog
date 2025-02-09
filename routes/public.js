// Public web routes
import express from 'express';
import PostController from '../controllers/postController.js';
import NewsletterController from '../controllers/NewsletterController.js';
import ComicBookController from '../controllers/ComicBookController.js';

const router = express.Router();

// Public routes
router.get('/', PostController.home);
router.get('/posts/:slug', PostController.show);

// Newsletter routes
router.post('/api/newsletter/subscribe', NewsletterController.subscribe);
router.get('/newsletter/verify/:token', NewsletterController.verify);
router.get('/newsletter/unsubscribe', NewsletterController.unsubscribe);

// Comic Book routes
router.get('/comics', ComicBookController.index);
router.get('/comics/:slug', ComicBookController.show);

export default router;
