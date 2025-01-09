// Middleware to handle file uploads

import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use disk storage
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        console.log('Starting image optimization...');
        
        const originalPath = req.file.path;
        // Change extension to .webp
        const tempPath = originalPath.replace(/\.[^.]+$/, '.webp');
        
        // Get original file size
        const originalStats = await fs.stat(originalPath);
        console.log('Original file size:', (originalStats.size / 1024 / 1024).toFixed(2) + 'MB');

        // Get metadata
        const metadata = await sharp(originalPath).metadata();
        console.log('Original dimensions:', `${metadata.width}x${metadata.height}`);

        // Create transform stream
        const transformer = sharp()
            .resize(1200, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({
                quality: 75,     // WebP can maintain higher quality
                effort: 4,       // 0-6, higher = better compression but slower
                lossless: false  // Set to true for transparent images
            });

        // Use pipeline to handle streams
        await pipeline(
            createReadStream(originalPath),
            transformer,
            createWriteStream(tempPath)
        );

        // Small delay to ensure files are closed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get temp file size
        const newStats = await fs.stat(tempPath);
        console.log('Optimized file size:', (newStats.size / 1024 / 1024).toFixed(2) + 'MB');
        console.log('Size reduction:', Math.round((1 - newStats.size / originalStats.size) * 100) + '%');

        // Replace original with WebP version
        try {
            await fs.unlink(originalPath);
            await fs.rename(tempPath, originalPath.replace(/\.[^.]+$/, '.webp'));
            
            // Update the file information for the response
            req.file.filename = req.file.filename.replace(/\.[^.]+$/, '.webp');
            req.file.path = req.file.path.replace(/\.[^.]+$/, '.webp');
        } catch (err) {
            console.error('Error replacing file:', err);
            // If we can't replace, keep the temp file and update the path
            req.file.path = tempPath;
            req.file.filename = path.basename(tempPath);
        }

        next();
    } catch (error) {
        console.error('Image optimization error:', error);
        console.error(error.stack);
        next(error);
    }
};

export default upload;
export { optimizeImage }; 