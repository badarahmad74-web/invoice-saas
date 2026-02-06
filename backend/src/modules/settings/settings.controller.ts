import { Request, Response } from 'express';
import { settingsService } from './settings.service';

export class SettingsController {
    async get(req: Request, res: Response) {
        const settings = await settingsService.getSettings(req.user!.organizationId);
        res.json(settings);
    }

    async update(req: Request, res: Response) {
        const settings = await settingsService.updateSettings(req.user!.organizationId, req.body);
        res.json(settings);
    }
}

export const settingsController = new SettingsController();
