import Post from '../models/Post.js';
import { deleteFile } from '../utils/storage.js';

export default class PostController {
    // Public routes
    static async listPublished(req, res) {
        try {
            const posts = await Post.find({ isPublished: true })
                .sort({ createdAt: -1 });
            
            // Add console.log to debug
            console.log('Posts with previews:', posts.map(post => ({
                title: post.title,
                preview: post.getPreview()
            })));

            const postsWithPreviews = posts.map(post => ({
                ...post.toObject(),
                preview: post.getPreview()
            }));

            res.render('public/index', { 
                title: 'Blog Posts',
                posts: postsWithPreviews,
                isAdmin: req.session.isAdmin
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async showPost(req, res) {
        try {
            const post = await Post.findOne({ slug: req.params.slug });
            if (!post) {
                return res.status(404).render('error', {
                    title: 'Error',
                    message: 'Post not found'
                });
            }

            // Restore the original console log
            console.log('Post data:', {
                title: post.title,
                images: post.images,
                content: post.content.substring(0, 100) + '...'
            });

            res.render('public/post', {
                title: post.title,
                post: post
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Admin routes
    static async createPost(req, res) {
        try {
            console.log('Creating post with data:', {
                title: req.body.title,
                images: req.body.images
            });

            const post = new Post({
                title: req.body.title,
                content: req.body.content,
                slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
                isPublished: req.body.isPublished === 'on',
                images: req.body.images ? req.body.images.split(',') : []
            });

            await post.save();
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async deletePost(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Delete associated images
            if (post.images?.length > 0) {
                for (const imageUrl of post.images) {
                    await deleteFile(imageUrl);
                }
            }

            await Post.findByIdAndDelete(req.params.id);
            res.json({ message: 'Post and associated images deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async showDashboard(req, res) {
        try {
            const posts = await Post.find()
                .sort({ createdAt: -1 });
            
            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                posts
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static showNewPostForm(req, res) {
        res.render('admin/new-post', { 
            title: 'New Post' 
        });
    }

    static async showEditForm(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            
            if (!post) {
                return res.status(404).render('error', {
                    title: 'Error',
                    message: 'Post not found'
                });
            }

            res.render('admin/edit-post', { 
                title: 'Edit Post',
                post 
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async updatePost(req, res) {
        try {
            const post = await Post.findByIdAndUpdate(
                req.params.id,
                {
                    title: req.body.title,
                    content: req.body.content,
                    slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
                    isPublished: req.body.isPublished === 'on',
                    images: req.body.images ? req.body.images.split(',') : []
                },
                { new: true }
            );

            if (!post) {
                return res.status(404).render('error', {
                    title: 'Error',
                    message: 'Post not found'
                });
            }

            res.redirect('/admin/dashboard');
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // API Methods
    static async apiListPosts(req, res) {
        try {
            const posts = await Post.find({ isPublished: true })
                .sort({ createdAt: -1 });
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async apiGetPost(req, res) {
        try {
            const post = await Post.findOne({ 
                slug: req.params.slug,
                isPublished: true 
            });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async apiCreatePost(req, res) {
        try {
            const post = new Post({
                title: req.body.title,
                content: req.body.content,
                slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
                isPublished: req.body.isPublished || false
            });
            await post.save();
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async apiUpdatePost(req, res) {
        try {
            const post = await Post.findOneAndUpdate(
                { slug: req.params.slug },
                {
                    title: req.body.title,
                    content: req.body.content,
                    isPublished: req.body.isPublished,
                    ...(req.body.title && {
                        slug: req.body.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
                    })
                },
                { new: true }
            );

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async apiDeletePost(req, res) {
        try {
            const post = await Post.findOneAndDelete({ slug: req.params.slug });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async apiDebugListAllPosts(req, res) {
        try {
            const posts = await Post.find({});
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static uploadMiddleware() {
        return upload.single('image');
    }

    static async handleImageUpload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    error: 'No file uploaded' 
                });
            }

            console.log('Upload file details:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                filename: req.file.filename
            });
            
            const imageUrl = `/uploads/${req.file.filename}`;
            console.log('Generated image URL:', imageUrl);
            
            res.json({ url: imageUrl });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    static async removeImage(req, res) {
        try {
            const { imageUrl } = req.body;
            
            if (!imageUrl) {
                return res.status(400).json({ 
                    error: 'No image URL provided' 
                });
            }

            await deleteFile(imageUrl);
            res.json({ message: 'Image deleted successfully' });
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    // Admin Web Methods
    static async listAllPosts(req, res) {
        try {
            const posts = await Post.find()
                .sort({ createdAt: -1 });
            
            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                posts
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }
} 