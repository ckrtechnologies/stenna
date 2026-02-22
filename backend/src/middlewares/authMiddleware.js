import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // 1. Try verifying as a backend-issued JWT (Admin uses this)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;
            return next();
        } catch (jwtError) {
            // Not a valid backend JWT, fall through to Supabase check
        }

        // 2. Try verifying as a Supabase Access Token (Website uses this)
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'No user found' });

    // Check custom JWT role OR Supabase metadata role
    const role = req.user.role || req.user.app_metadata?.role || req.user.user_metadata?.role;

    if (role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Require Admin Role' });
    }
};
