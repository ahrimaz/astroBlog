import Subscriber from '../models/Subscriber.js';
import { sendVerificationEmail, sendWelcomeEmail, sendNewsletterEmail } from '../utils/email.js';
import crypto from 'crypto';
import Post from '../models/Post.js';

export default class NewsletterController {
    static async subscribe(req, res) {
        try {
            const { email } = req.body;

            // Check if already subscribed
            const existing = await Subscriber.findOne({ email });
            if (existing) {
                if (existing.isVerified) {
                    return res.status(400).json({ 
                        error: 'This email is already subscribed' 
                    });
                } else {
                    // Resend verification email
                    await sendVerificationEmail(email, existing.verificationToken);
                    return res.json({ 
                        message: 'Verification email resent' 
                    });
                }
            }

            // Create new subscriber
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const subscriber = new Subscriber({
                email,
                verificationToken
            });
            
            await subscriber.save();
            await sendVerificationEmail(email, verificationToken);

            res.json({ 
                message: 'Please check your email to confirm subscription' 
            });
        } catch (error) {
            console.error('Subscribe error:', error);
            res.status(500).json({ 
                error: 'Failed to subscribe' 
            });
        }
    }

    static async verify(req, res) {
        try {
            const { token } = req.params;

            // Find subscriber with this token
            const subscriber = await Subscriber.findOne({ verificationToken: token });
            
            if (!subscriber) {
                return res.status(404).render('error', {
                    title: 'Verification Error',
                    message: 'Invalid or expired verification link'
                });
            }

            if (subscriber.isVerified) {
                return res.render('newsletter/verified', {
                    title: 'Already Verified',
                    message: 'Email already verified'
                });
            }

            // Update subscriber
            subscriber.isVerified = true;
            subscriber.verificationToken = undefined; // Clear the token
            await subscriber.save();

            // Send welcome email
            await sendWelcomeEmail(subscriber.email);

            // Render success page
            res.render('newsletter/verified', {
                title: 'Email Verified',
                message: 'Email verified successfully!'
            });

        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to verify email'
            });
        }
    }

    static async unsubscribe(req, res) {
        try {
            const { email, token } = req.query;
            
            // Find subscriber
            const subscriber = await Subscriber.findOne({ email });
            
            if (!subscriber) {
                return res.status(404).render('newsletter/unsubscribed', {
                    title: 'Not Found',
                    message: 'Email address not found in our subscription list.'
                });
            }

            // Verify unsubscribe token (prevent unauthorized unsubscribes)
            const expectedToken = crypto
                .createHash('sha256')
                .update(email + process.env.APP_SECRET)
                .digest('hex');
                
            if (token !== expectedToken) {
                return res.status(400).render('error', {
                    title: 'Invalid Request',
                    message: 'Invalid unsubscribe link.'
                });
            }

            // Remove subscriber
            await Subscriber.deleteOne({ email });

            // Render success page
            res.render('newsletter/unsubscribed', {
                title: 'Unsubscribed',
                message: 'You have been successfully unsubscribed.'
            });

        } catch (error) {
            console.error('Unsubscribe error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to process unsubscribe request.'
            });
        }
    }

    static async adminListSubscribers(req, res) {
        console.log('adminListSubscribers method called');
        try {
            const subscribers = await Subscriber.find()
                .sort({ createdAt: -1 });
            
            res.render('admin/newsletter/index', {
                title: 'Newsletter Management',
                subscribers
            });
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to fetch subscribers'
            });
        }
    }

    static async adminSendNewsletter(req, res) {
        try {
            const subscribers = await Subscriber.find({ isVerified: true });
            
            res.render('admin/newsletter/send', {
                title: 'Send Newsletter',
                subscriberCount: subscribers.length
            });
        } catch (error) {
            console.error('Error loading send page:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load send newsletter page'
            });
        }
    }

    static async adminSendNewsletterGet(req, res) {
        try {
            const subscriberCount = await Subscriber.countDocuments({ isVerified: true });
            res.render('admin/newsletter/send', { subscriberCount });
        } catch (error) {
            console.error('Error loading send newsletter page:', error);
            res.redirect('/admin/newsletter');
        }
    }

    static async adminSendNewsletterPost(req, res) {
        try {
            const { subject, content } = req.body;
            const subscribers = await Subscriber.find({ isVerified: true });
            
            // Send to all verified subscribers
            for (const subscriber of subscribers) {
                await sendNewsletterEmail(subscriber.email, subject, content);
            }
            
            res.json({ message: `Newsletter sent to ${subscribers.length} subscribers` });
        } catch (error) {
            console.error('Error sending newsletter:', error);
            res.status(500).json({ error: 'Failed to send newsletter' });
        }
    }

    static async adminRemoveSubscriber(req, res) {
        try {
            const { id } = req.params;
            await Subscriber.findByIdAndDelete(id);
            
            // Send a success response
            res.json({ message: 'Subscriber removed successfully' });
        } catch (error) {
            console.error('Error removing subscriber:', error);
            res.status(500).json({ error: 'Failed to remove subscriber' });
        }
    }

    static async adminDashboard(req, res) {
        try {
            const posts = await Post.find().sort({ createdAt: -1 });
            const subscriberCount = await Subscriber.countDocuments({ isVerified: true });
            const publishedCount = await Post.countDocuments({ isPublished: true });

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                posts,
                subscriberCount,
                publishedCount
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            res.status(500).send('Error loading dashboard');
        }
    }
} 