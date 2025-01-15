import Admin from '../models/Admin.js';

export default async function adminAuth(req, res, next) {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    next();
}
