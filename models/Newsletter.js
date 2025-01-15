import mongoose from 'mongoose';
import Subscriber from './Subscriber.js';
import { sendNewsletterEmail } from '../utils/email.js';

const newsletterSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    recipientCount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

newsletterSchema.statics.sendNewsletter = async function(subject, content) {
    const subscribers = await Subscriber.find({ isVerified: true });
    
    // Send to all verified subscribers
    for (const subscriber of subscribers) {
        await sendNewsletterEmail(subscriber.email, subject, content);
    }
    
    // Save newsletter record
    return await this.createNewsletter(subject, content, subscribers.length);
};

newsletterSchema.statics.createNewsletter = async function(subject, content, recipientCount) {
    return await this.create({
        subject,
        content,
        recipientCount
    });
};

newsletterSchema.statics.getRecentNewsletters = async function(limit = 10) {
    return await this.find()
        .sort({ sentAt: -1 })
        .limit(limit);
};

export default mongoose.model('Newsletter', newsletterSchema); 