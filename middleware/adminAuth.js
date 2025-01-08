// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

export default adminAuth;
