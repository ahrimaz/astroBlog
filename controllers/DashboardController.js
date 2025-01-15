import Post from '../models/Post.js';
import Subscriber from '../models/Subscriber.js';
import Newsletter from '../models/Newsletter.js';

export default class DashboardController {
    static async show(req, res) {
        try {
            // Get all stats in parallel for better performance
            const [recentPosts, subscriberCount, totalPosts, publishedCount, recentNewsletters] = await Promise.all([
                Post.find().sort({ createdAt: -1 }).limit(5),  // Only limit for recent posts
                Subscriber.countDocuments({ isVerified: true }),
                Post.countDocuments(),  // Get total post count
                Post.countDocuments({ isPublished: true }),
                Newsletter.getRecentNewsletters(5)
            ]);

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                posts: recentPosts,
                totalPosts,  // Pass total posts count
                subscriberCount,
                publishedCount,
                recentNewsletters
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }
} 