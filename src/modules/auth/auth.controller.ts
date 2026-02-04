import { Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.dto';
import { z } from 'zod';

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const data = registerSchema.parse(req.body);
            const result = await authService.register(data);

            // Exclude password from response
            const { password, ...userWithoutPassword } = result.user;

            res.status(201).json({
                user: userWithoutPassword,
                token: result.token,
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else if (error.message === 'User already exists') {
                res.status(409).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    async login(req: Request, res: Response) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await authService.login(data);

            const { password, ...userWithoutPassword } = result.user;

            res.status(200).json({
                user: userWithoutPassword,
                token: result.token,
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else if (error.message === 'Invalid credentials') {
                res.status(401).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
}

export const authController = new AuthController();
