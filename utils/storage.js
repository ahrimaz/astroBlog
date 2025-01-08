// Storage service

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LocalStorage {
    async save(file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.originalname;
        const uploadPath = join(__dirname, '../public/uploads', filename);
        
        // Create uploads directory if it doesn't exist
        await fs.mkdir(join(__dirname, '../public/uploads'), { recursive: true });
        
        // Copy file to uploads directory
        await fs.copyFile(file.path, uploadPath);
        
        // Remove temporary file
        await fs.unlink(file.path);
        
        // Return the public URL
        return `/uploads/${filename}`;
    }

    async delete(filename) {
        const filepath = join(__dirname, '../public', filename);
        await fs.unlink(filepath);
    }
}

// Future AWS S3 or other service
class S3Storage {
    constructor() {
        // Initialize S3 client
        if (process.env.AWS_ACCESS_KEY_ID) {
            console.log('AWS S3 storage initialized');
        }
    }

    async save(file) {
        // Implement S3 upload logic
        throw new Error('S3 storage not implemented');
    }

    async delete(filename) {
        // Implement S3 delete logic
        throw new Error('S3 storage not implemented');
    }
}

// Factory function to get the appropriate storage
export function getStorage() {
    switch (process.env.STORAGE_TYPE) {
        case 's3':
            return new S3Storage();
        case 'local':
        default:
            return new LocalStorage();
    }
}

export async function deleteFile(imageUrl) {
    try {
        if (!imageUrl) return;

        // Get the filename from the URL
        const filename = path.basename(imageUrl);
        const filepath = path.join('public/uploads', filename);

        // Check if file exists before trying to delete
        await fs.access(filepath);
        await fs.unlink(filepath);
    } catch (error) {
        console.error('Error deleting file:', error);
        // Don't throw error if file doesn't exist
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
} 