import { Request, Response } from 'express';
import { productService } from './products.service';
import { createProductSchema, updateProductSchema } from './products.dto';
import { z } from 'zod';

export class ProductController {
    async create(req: Request, res: Response) {
        try {
            const data = createProductSchema.parse(req.body);
            const product = await productService.create(req.user!.organizationId, data);
            res.status(201).json(product);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    async findAll(req: Request, res: Response) {
        const products = await productService.findAll(req.user!.organizationId);
        res.json(products);
    }

    async findOne(req: Request, res: Response) {
        const productId = req.params.id as string;
        const product = await productService.findOne(req.user!.organizationId, productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }

    async update(req: Request, res: Response) {
        try {
            const productId = req.params.id as string;
            const data = updateProductSchema.parse(req.body);
            const product = await productService.update(req.user!.organizationId, productId, data);
            res.json(product);
        } catch (error: any) {
            if (error.message === 'Product not found') {
                res.status(404).json({ error: 'Product not found' });
            } else if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const productId = req.params.id as string;
            await productService.delete(req.user!.organizationId, productId);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Product not found') {
                res.status(404).json({ error: 'Product not found' });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
}

export const productController = new ProductController();
