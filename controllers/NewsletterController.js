import Newsletter from '../models/Newsletter.js';
import Subscriber from '../models/Subscriber.js';

export default class NewsletterController {
    static async subscribe(req, res) {
        try {
            const { email } = req.body;
            const result = await Subscriber.subscribeNew(email);
            res.json(result);
        } catch (error) {
            console.error('Subscribe error:', error);
            res.status(500).json({ error: error.message || 'Failed to subscribe' });
        }
    }

    static async verify(req, res) {
        try {
            const { token } = req.params;
            const result = await Subscriber.verifyEmail(token);
            res.render('newsletter/verified', {
                title: 'Email Verified',
                message: result.message
            });
        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message || 'Failed to verify email'
            });
        }
    }

    static async unsubscribe(req, res) {
        try {
            const { email, token } = req.query;
            const result = await Subscriber.unsubscribe(email, token);
            res.render('newsletter/unsubscribed', {
                title: 'Unsubscribed',
                message: result.message
            });
        } catch (error) {
            console.error('Unsubscribe error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message || 'Failed to process unsubscribe request'
            });
        }
    }

    static async sendNewsletter(req, res) {
        try {
            const { subject, content } = req.body;
            await Newsletter.sendNewsletter(subject, content);
            res.json({ message: 'Newsletter sent successfully' });
        } catch (error) {
            console.error('Error sending newsletter:', error);
            res.status(500).json({ error: error.message || 'Failed to send newsletter' });
        }
    }

    static async adminListSubscribers(req, res) {
        try {
            const subscribers = await Subscriber.find().sort({ createdAt: -1 });
            res.render('admin/newsletter/index', {
                title: 'Newsletter Management',
                subscribers
            });
        } catch (error) {
            console.error('Error listing subscribers:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async showSendForm(req, res) {
        try {
            const subscriberCount = await Subscriber.countDocuments({ isVerified: true });
            res.render('admin/newsletter/send', {
                title: 'Send Newsletter',
                subscriberCount
            });
        } catch (error) {
            console.error('Error loading send form:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async listSentNewsletters(req, res) {
        try {
            const newsletters = await Newsletter.getRecentNewsletters();
            res.render('admin/newsletter/history', {
                title: 'Newsletter History',
                newsletters
            });
        } catch (error) {
            console.error('Error loading newsletter history:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async adminRemoveSubscriber(req, res) {
        try {
            await Subscriber.findByIdAndDelete(req.params.id);
            res.json({ message: 'Subscriber removed successfully' });
        } catch (error) {
            console.error('Error removing subscriber:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to remove subscriber' 
            });
        }
    }
} 