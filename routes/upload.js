import { upload, optimizeImage } from '../middleware/upload.js';

router.post('/upload', upload.single('image'), optimizeImage, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({ 
            url: req.file.path,
            message: 'File uploaded and optimized successfully' 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
}); 