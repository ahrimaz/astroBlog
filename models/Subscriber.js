import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email.js';

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String
}, { timestamps: true });

// Static methods for subscriber operations
subscriberSchema.statics.subscribeNew = async function(email) {
    const existing = await this.findOne({ email });
    if (existing) {
        if (existing.isVerified) {
            throw new Error('This email is already subscribed');
        }
        await sendVerificationEmail(email, existing.verificationToken);
        return { message: 'Verification email resent' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const subscriber = await this.create({
        email,
        verificationToken
    });
    
    await sendVerificationEmail(email, verificationToken);
    return { message: 'Please check your email to confirm subscription' };
};

subscriberSchema.statics.verifyEmail = async function(token) {
    const subscriber = await this.findOne({ verificationToken: token });
    if (!subscriber) {
        throw new Error('Invalid or expired verification link');
    }
    
    if (subscriber.isVerified) {
        return { message: 'Email already verified' };
    }

    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    await subscriber.save();
    await sendWelcomeEmail(subscriber.email);
    
    return { message: 'Email verified successfully!' };
};

subscriberSchema.statics.unsubscribe = async function(email, token) {
    const subscriber = await this.findOne({ email });
    if (!subscriber) {
        throw new Error('Email address not found in our subscription list.');
    }

    const expectedToken = crypto
        .createHash('sha256')
        .update(email + process.env.APP_SECRET)
        .digest('hex');
        
    if (token !== expectedToken) {
        throw new Error('Invalid unsubscribe link.');
    }

    await this.deleteOne({ email });
    return { message: 'You have been successfully unsubscribed.' };
};

export default mongoose.model('Subscriber', subscriberSchema); 