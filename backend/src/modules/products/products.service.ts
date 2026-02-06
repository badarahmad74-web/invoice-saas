import { prisma } from '../../shared/infra/db';
import { CreateProductDto, UpdateProductDto } from './products.dto';

export class ProductService {
    async create(organizationId: string, data: CreateProductDto) {
        return prisma.product.create({
            data: {
                ...data,
                organizationId,
            },
        });
    }

    async findAll(organizationId: string) {
        return prisma.product.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(organizationId: string, productId: string) {
        return prisma.product.findFirst({
            where: { id: productId, organizationId },
        });
    }

    async update(organizationId: string, productId: string, data: UpdateProductDto) {
        const product = await this.findOne(organizationId, productId);
        if (!product) throw new Error('Product not found');

        return prisma.product.update({
            where: { id: productId },
            data,
        });
    }

    async delete(organizationId: string, productId: string) {
        const product = await this.findOne(organizationId, productId);
        if (!product) throw new Error('Product not found');

        return prisma.product.delete({
            where: { id: productId },
        });
    }
}

export const productService = new ProductService();
