require('dotenv').config();
const jwt = require('jsonwebtoken');

const authorizeDentist = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 3) {
            return res.status(403).json({ error: 'Forbidden. Not an dentist.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(400).json({ error: 'Invalid token.' });
    }
};

module.exports = authorizeDentist;