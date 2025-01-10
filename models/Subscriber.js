import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Subscriber', subscriberSchema); 