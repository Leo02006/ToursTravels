import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
        return;
    }

    try {
        const decoded = verifyToken(token) as { id: string };
        if (!decoded) {
            res.status(401).json({ error: 'Not authorized, token failed' });
            return;
        }

        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

export const optionalProtect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = verifyToken(token) as { id: string };
        if (decoded) {
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (error) {
        // Ignoring token errors for optional routes
    }

    next();
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: `User role ${req.user?.role} is not authorized to access this route` });
            return;
        }
        next();
    };
};

export const admin = authorize('ADMIN');
