import mongoose from 'mongoose';

const comicBookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    coverImage: {
        type: String,
        required: true
    },
    gallery: [{
        type: String,
        required: true
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

// Add generateSlug method to schema
comicBookSchema.methods.generateSlug = function() {
    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
};

// Pre-validate middleware to ensure slug is generated before validation
comicBookSchema.pre('validate', function(next) {
    if (this.isModified('title')) {
        this.generateSlug();
    }
    next();
});

// Pre-save middleware for publishedAt
comicBookSchema.pre('save', function(next) {
    if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Create and export the model
const ComicBook = mongoose.model('ComicBook', comicBookSchema);
export default ComicBook; 