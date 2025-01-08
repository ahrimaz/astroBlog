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
    timestamps: true  // This will automatically add createdAt and updatedAt fields
});

// Create a compound index for efficient querying
postSchema.index({ slug: 1, isPublished: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
