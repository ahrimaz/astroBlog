// Post model

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    images: [{
        type: String
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Add this pre-save middleware to set publishedAt
postSchema.pre('save', function(next) {
    if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Existing instance methods
postSchema.methods = {
    getPreview(length = 200) {
        return this.content
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, length) + '...';
    },

    getFormattedDate() {
        return this.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Static methods for operations currently in controller
postSchema.statics = {
    // Find published posts with previews
    async findPublishedWithPreviews() {
        const posts = await this.find({ isPublished: true })
            .sort({ createdAt: -1 });
        
        return posts.map(post => ({
            ...post.toObject(),
            preview: post.getPreview()
        }));
    },

    // Find by slug
    findBySlug(slug) {
        return this.findOne({ slug });
    },

    // Create new post
    createFromRequest(data) {
        // Extract image URLs from content using regex
        const contentImages = (data.content.match(/<img[^>]+src="([^">]+)"/g) || [])
            .map(img => img.match(/src="([^">]+)"/)[1]);

        return this.create({
            title: data.title,
            content: data.content,
            slug: this.generateSlug(data.title),
            isPublished: data.isPublished === 'on',
            images: contentImages // Only store images that are actually in the content
        });
    },

    // Update post
    async updateFromRequest(id, data) {
        // Extract image URLs from content using regex
        const contentImages = (data.content.match(/<img[^>]+src="([^">]+)"/g) || [])
            .map(img => img.match(/src="([^">]+)"/)[1]);

        return this.findByIdAndUpdate(
            id,
            {
                title: data.title,
                content: data.content,
                slug: this.generateSlug(data.title),
                isPublished: data.isPublished === 'on',
                images: contentImages // Only store images that are actually in the content
            },
            { new: true }
        );
    },

    // Generate slug (utility method)
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    },

    // Add static method for deleting posts
    deletePostById: async function(id) {
        try {
            const post = await this.findById(id);
            if (!post) {
                throw new Error('Post not found');
            }
            await this.findByIdAndDelete(id);
            return true;
        } catch (error) {
            throw error;
        }
    }
};

// Existing indexes
postSchema.index({ slug: 1, isPublished: 1 });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);
