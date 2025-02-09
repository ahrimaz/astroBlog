import ComicBook from '../models/ComicBook.js';

export default class ComicBookController {
    // Public methods
    static async index(req, res) {
        try {
            const comics = await ComicBook.find({ isPublished: true })
                .sort({ createdAt: -1 });
            res.render('comics/index', {
                title: 'Comic Books & Illustrations',
                comics
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async show(req, res) {
        try {
            const comic = await ComicBook.findOne({
                slug: req.params.slug,
                isPublished: true
            });
            
            if (!comic) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Comic not found'
                });
            }

            res.render('comics/show', {
                title: comic.title,
                comic
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    // Admin methods
    static async adminIndex(req, res) {
        try {
            const comics = await ComicBook.find()
                .sort({ createdAt: -1 });
            res.render('admin/comics/index', {
                title: 'Comics Management',
                comics
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async create(req, res) {
        try {
            const comic = new ComicBook({
                title: req.body.title,
                description: req.body.description,
                isPublished: !!req.body.isPublished
            });

            if (req.files.coverImage) {
                comic.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
            }

            if (req.files.gallery) {
                comic.gallery = req.files.gallery.map(file => `/uploads/${file.filename}`);
            }

            await comic.save();
            res.redirect('/admin/comics');
        } catch (error) {
            console.error('Error creating comic:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async edit(req, res) {
        try {
            const comic = await ComicBook.findById(req.params.id);
            if (!comic) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Comic not found'
                });
            }

            res.render('admin/comics/edit', {
                title: 'Edit Comic Book',
                comic
            });
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const comic = await ComicBook.findById(req.params.id);
            if (!comic) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Comic not found'
                });
            }

            // Update basic fields
            comic.title = req.body.title;
            comic.description = req.body.description;
            comic.isPublished = !!req.body.isPublished;

            // Handle cover image update
            if (req.files && req.files.coverImage && req.files.coverImage[0]) {
                comic.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
            }

            // Get the ordered list of existing images
            const galleryOrder = req.body.galleryOrder ? JSON.parse(req.body.galleryOrder) : [];
            const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

            // Start with ordered existing images that weren't removed
            let updatedGallery = galleryOrder.filter(image => !removedImages.includes(image));

            // Add any new uploaded images to the end
            if (req.files && req.files.gallery) {
                const newGalleryImages = req.files.gallery.map(file => `/uploads/${file.filename}`);
                updatedGallery = updatedGallery.concat(newGalleryImages);
            }

            // Update the comic's gallery with the new order
            comic.gallery = updatedGallery;

            await comic.save();
            res.redirect('/admin/comics');
        } catch (error) {
            console.error('Error updating comic:', error);
            res.redirect(`/admin/comics/${req.params.id}/edit`);
        }
    }

    static async delete(req, res) {
        try {
            await ComicBook.findByIdAndDelete(req.params.id);
            res.json({ message: 'Comic deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
} 