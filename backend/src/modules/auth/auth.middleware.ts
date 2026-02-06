import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/jwt';

// Extend Express Request to include User
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                organizationId: string;
                role: string;
            };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Token error' });
    }

    const token = parts[1];
    const decoded = verifyToken<{ userId: string; organizationId: string; role: string }>(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
};

export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(403).json({ error: 'Organization context required' });
    }
    next();
};
