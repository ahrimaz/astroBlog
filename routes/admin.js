// Admin routes

import express from 'express';
import PostController from '../controllers/postController.js';
import NewsletterController from '../controllers/NewsletterController.js';
import { upload, optimizeImage } from '../middleware/upload.js';
import adminAuth from '../middleware/adminAuth.js';
import DashboardController from '../controllers/DashboardController.js';
import multer from 'multer';
import ComicBookController from '../controllers/ComicBookController.js';

const router = express.Router();

// Auth routes (before adminAuth)
router.get('/login', (req, res) => res.render('admin/login', { title: 'Admin Login' }));
router.post('/login', (req, res) => {
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
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Protected routes
router.use(adminAuth);

// Dashboard
router.get('/dashboard', DashboardController.show);

// Posts management
router.get('/posts', PostController.index);
router.get('/posts/new', PostController.new);
router.post('/posts', PostController.create);
router.get('/posts/:id/edit', PostController.edit);
router.put('/posts/:id', PostController.update);
router.delete('/posts/:id', PostController.delete);

// Image uploads
router.post('/upload', upload.single('image'), optimizeImage, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({ 
            url: `/uploads/${req.file.filename}`,
            message: 'File uploaded and optimized successfully' 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// TinyMCE specific upload endpoint
router.post('/upload-image', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            // Handle Multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File is too large. Maximum size is 5MB'
                    });
                }
            }
            // Handle other errors
            console.error('Upload error:', err);
            return res.status(400).json({
                error: err.message || 'Failed to upload file'
            });
        }

        // No file uploaded
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No file uploaded' 
            });
        }

        // Process image optimization
        optimizeImage(req, res, (err) => {
            if (err) {
                console.error('Optimization error:', err);
                return res.status(500).json({
                    error: 'Failed to process image'
                });
            }

            res.json({
                location: `/uploads/${req.file.filename}`
            });
        });
    });
});

// Newsletter management
router.get('/newsletter', NewsletterController.adminListSubscribers);
router.get('/newsletter/send', NewsletterController.showSendForm);
router.post('/newsletter/send', NewsletterController.sendNewsletter);
router.get('/newsletter/history', NewsletterController.listSentNewsletters);
router.delete('/newsletter/subscribers/:id', NewsletterController.adminRemoveSubscriber);

// Comic Book routes
router.get('/comics', ComicBookController.adminIndex);
router.get('/comics/new', (req, res) => res.render('admin/comics/new', { title: 'New Comic Book' }));
router.post('/comics', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]), ComicBookController.create);
router.get('/comics/:id/edit', ComicBookController.edit);
router.put('/comics/:id', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]), ComicBookController.update);
router.delete('/comics/:id', ComicBookController.delete);

export default router;
