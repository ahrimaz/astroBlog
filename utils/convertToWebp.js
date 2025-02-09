import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function convertImage(filepath) {
    try {
        // Skip if already WebP
        if (filepath.toLowerCase().endsWith('.webp')) {
            return null;
        }

        const webpPath = filepath.replace(/\.[^.]+$/, '.webp');
        
        console.log(`Converting: ${path.basename(filepath)}`);
        
        // Get original size
        const originalStats = await fs.stat(filepath);
        
        // Convert to WebP
        await sharp(filepath)
            .resize(1200, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({
                quality: 75,
                effort: 4,
                lossless: false
            })
            .toFile(webpPath);

        // Get new size
        const newStats = await fs.stat(webpPath);
        
        // Wait a bit before trying to delete
        await wait(100);

        // Try to delete original with retries
        let retries = 3;
        while (retries > 0) {
            try {
                await fs.unlink(filepath);
                break;
            } catch (error) {
                retries--;
                if (retries === 0) {
                    console.warn(`Warning: Could not delete ${filepath}. You may need to delete it manually.`);
                } else {
                    await wait(1000); // Wait 1 second before retry
                }
            }
        }

        console.log(`Converted: ${path.basename(filepath)}`);
        console.log(`Size reduction: ${Math.round((1 - newStats.size / originalStats.size) * 100)}%\n`);

        return path.basename(webpPath);
    } catch (error) {
        console.error(`Error converting ${filepath}:`, error);
        return null;
    }
}

async function updateDatabase(oldPath, newPath) {
    try {
        // Update posts that reference this image
        await Post.updateMany(
            { "images": { $regex: oldPath } },
            { $set: { "images.$": newPath } }
        );

        // Update image references in content
        const posts = await Post.find({ "content": { $regex: oldPath } });
        for (const post of posts) {
            post.content = post.content.replace(
                new RegExp(oldPath, 'g'), 
                newPath
            );
            await post.save();
        }
    } catch (error) {
        console.error(`Error updating database for ${oldPath}:`, error);
    }
}

async function cleanupOldFiles() {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    const files = await fs.readdir(uploadsDir);
    
    console.log('\nCleaning up old files...');
    
    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const filepath = path.join(uploadsDir, file);
            try {
                // Try to delete with retries
                let retries = 3;
                while (retries > 0) {
                    try {
                        await fs.unlink(filepath);
                        console.log(`Deleted: ${file}`);
                        break;
                    } catch (error) {
                        retries--;
                        if (retries === 0) {
                            console.warn(`Warning: Could not delete ${file}. You may need to delete it manually.`);
                        } else {
                            await wait(1000); // Wait 1 second before retry
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to delete ${file}:`, error);
            }
        }
    }
}

async function convertAllImages() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const uploadsDir = path.join(__dirname, '../public/uploads');
        const files = await fs.readdir(uploadsDir);

        console.log(`Found ${files.length} files in uploads directory\n`);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                const filepath = path.join(uploadsDir, file);
                const newFilename = await convertImage(filepath);
                
                if (newFilename) {
                    // Update database references
                    await updateDatabase(
                        `/uploads/${file}`,
                        `/uploads/${newFilename}`
                    );
                }
            }
        }

        // Final cleanup step
        await cleanupOldFiles();

        console.log('\nConversion and cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the conversion
convertAllImages(); 