import { Request, Response } from 'express';
import { clientService } from './clients.service';
import { createClientSchema, updateClientSchema } from './clients.dto';
import { z } from 'zod';

export class ClientController {
    async create(req: Request, res: Response) {
        try {
            const data = createClientSchema.parse(req.body);
            const client = await clientService.create(req.user!.organizationId, data);
            res.status(201).json(client);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    async findAll(req: Request, res: Response) {
        const clients = await clientService.findAll(req.user!.organizationId);
        res.json(clients);
    }

    async findOne(req: Request, res: Response) {
        const clientId = req.params.id as string;
        const client = await clientService.findOne(req.user!.organizationId, clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.json(client);
    }

    async update(req: Request, res: Response) {
        try {
            const clientId = req.params.id as string;
            const data = updateClientSchema.parse(req.body);
            const client = await clientService.update(req.user!.organizationId, clientId, data);
            res.json(client);
        } catch (error: any) {
            if (error.message === 'Client not found') {
                res.status(404).json({ error: 'Client not found' });
            } else if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const clientId = req.params.id as string;
            await clientService.delete(req.user!.organizationId, clientId);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Client not found') {
                res.status(404).json({ error: 'Client not found' });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
}

export const clientController = new ClientController();
