import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/infra/db';
import { Prisma } from '@prisma/client';
import { signToken } from '../../shared/utils/jwt';
import { RegisterDto, LoginDto } from './auth.dto';

export class AuthService {
    async register(data: RegisterDto) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Transaction: Create Organization AND User
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const org = await tx.organization.create({
                data: {
                    name: data.organizationName,
                },
            });

            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    name: data.name,
                    organizationId: org.id,
                    role: 'OWNER',
                },
            });

            return { user, org };
        });

        const token = signToken({ userId: result.user.id, organizationId: result.org.id, role: result.user.role });

        return { user: result.user, token };
    }

    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(data.password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const token = signToken({ userId: user.id, organizationId: user.organizationId, role: user.role });

        return { user, token };
    }
}

export const authService = new AuthService();
