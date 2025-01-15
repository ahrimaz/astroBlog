import Post from '../models/Post.js';

export default class PostController {
    // List all posts (admin view)
    static async index(req, res) {
        try {
            const posts = await Post.find().sort({ createdAt: -1 });
            res.render('admin/posts/index', {
                title: 'Posts Management',
                posts
            });
        } catch (error) {
            console.error('Error listing posts:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Show form to create new post
    static async new(req, res) {
        res.render('admin/posts/new', {
            title: 'New Post'
        });
    }

    // Create new post
    static async create(req, res) {
        try {
            const { title, content, isPublished } = req.body;
            await Post.create({
                title,
                content,
                slug: Post.generateSlug(title),
                isPublished: !!isPublished
            });
            res.redirect('/admin/posts');
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Show form to edit post
    static async edit(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Post not found'
                });
            }
            res.render('admin/posts/edit', {
                title: 'Edit Post',
                post
            });
        } catch (error) {
            console.error('Error loading post:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Update post
    static async update(req, res) {
        try {
            const { title, content, isPublished } = req.body;
            const post = await Post.findById(req.params.id);
            
            if (!post) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Post not found'
                });
            }

            // If we're publishing for the first time, set publishedAt
            if (isPublished && !post.isPublished && !post.publishedAt) {
                post.publishedAt = new Date();
            }

            post.title = title;
            post.content = content;
            post.slug = Post.generateSlug(title);
            post.isPublished = !!isPublished;

            await post.save();
            res.redirect('/admin/posts');
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Delete post
    static async delete(req, res) {
        try {
            await Post.findByIdAndDelete(req.params.id);
            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to delete post' 
            });
        }
    }

    // Add this method for the public home page
    static async home(req, res) {
        try {
            const posts = await Post.find({ isPublished: true })
                .sort({ createdAt: -1 })
                .limit(10);  // Get latest 10 posts
                
            res.render('public/index', {
                title: 'Blog Home',
                posts
            });
        } catch (error) {
            console.error('Error loading home page:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async show(req, res) {
        try {
            const post = await Post.findOne({ 
                slug: req.params.slug,
                isPublished: true 
            });

            if (!post) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Post not found'
                });
            }

            res.render('public/post', {
                title: post.title,
                post
            });
        } catch (error) {
            console.error('Error showing post:', error);
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
                .sort({ createdAt: -1 })
                .select('title slug excerpt createdAt updatedAt');
                
            res.json(posts);
        } catch (error) {
            console.error('Error listing posts:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to list posts' 
            });
        }
    }

    static async apiGetPost(req, res) {
        try {
            const post = await Post.findOne({ 
                slug: req.params.slug,
                isPublished: true 
            });

            if (!post) {
                return res.status(404).json({ 
                    error: 'Post not found' 
                });
            }

            res.json(post);
        } catch (error) {
            console.error('Error getting post:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to get post' 
            });
        }
    }

    static async apiCreatePost(req, res) {
        try {
            const { title, content, isPublished } = req.body;
            const post = await Post.create({
                title,
                content,
                isPublished: !!isPublished
            });
            res.status(201).json(post);
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to create post' 
            });
        }
    }

    static async apiUpdatePost(req, res) {
        try {
            const { title, content, isPublished } = req.body;
            const post = await Post.findOneAndUpdate(
                { slug: req.params.slug },
                { title, content, isPublished: !!isPublished },
                { new: true }
            );

            if (!post) {
                return res.status(404).json({ 
                    error: 'Post not found' 
                });
            }

            res.json(post);
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to update post' 
            });
        }
    }

    static async apiDeletePost(req, res) {
        try {
            const post = await Post.findOneAndDelete({ 
                slug: req.params.slug 
            });

            if (!post) {
                return res.status(404).json({ 
                    error: 'Post not found' 
                });
            }

            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to delete post' 
            });
        }
    }
} 