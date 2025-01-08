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
    }
}, {
    timestamps: true
});

postSchema.index({ slug: 1, isPublished: 1 });

postSchema.methods.getPreview = function(length = 200) {
    // Strip HTML tags and get preview
    return this.content
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim()                   // Remove leading/trailing whitespace
        .substring(0, length) + '...';
};

export default mongoose.model('Post', postSchema);
