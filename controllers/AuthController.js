import Admin from '../models/Admin.js';

export default class AuthController {
    static async login(req, res) {
        try {
            const token = await Admin.authenticate(req.body.password);
            
            if (token) {
                req.session.adminToken = token;
                res.redirect('/admin/dashboard');
            } else {
                res.render('admin/login', { 
                    title: 'Admin Login',
                    error: 'Invalid password'
                });
            }
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }

    static async logout(req, res) {
        try {
            if (req.session.adminToken) {
                await Admin.removeToken(req.session.adminToken);
            }
            req.session.destroy();
            res.redirect('/');
        } catch (error) {
            res.status(500).render('error', {
                title: 'Error',
                message: error.message
            });
        }
    }
} 