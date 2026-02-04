import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const signToken = (payload: object): string => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = <T>(token: string): T | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as T;
    } catch (error) {
        return null;
    }
};
