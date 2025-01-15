import mongoose from 'mongoose';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 24 * 60 * 60 // Token expires after 24 hours
        }
    }],
    lastLogin: Date
}, { timestamps: true });

// Static methods
adminSchema.statics = {
    async authenticate(password) {
        if (password === process.env.ADMIN_PASSWORD) {
            const token = crypto.randomBytes(32).toString('hex');
            await this.findOneAndUpdate(
                { username: 'admin' },
                { 
                    $push: { tokens: { token } },
                    lastLogin: new Date()
                },
                { upsert: true }
            );
            return token;
        }
        return null;
    },

    async verifyToken(token) {
        const admin = await this.findOne({
            'tokens.token': token,
            'tokens.createdAt': { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        return !!admin;
    },

    async removeToken(token) {
        await this.updateOne(
            {},
            { $pull: { tokens: { token } } }
        );
    }
};

export default mongoose.model('Admin', adminSchema); 