import { Request, Response, NextFunction } from 'express';

export const serviceAuthMiddleware = (req: Request, res: Response, next: NextFunction): Response | any => {
    const authHeader = req.headers['authorization'];
    const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

    if (!SERVICE_TOKEN) {
        console.error("Error: SERVICE_TOKEN not configured for internal route.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    const parts = authHeader?.split(' ');
    const token = (parts && parts.length === 2 && parts[0]?.toLowerCase() === 'bearer') ? parts[1] : null;

    if (!token || token !== SERVICE_TOKEN) {
        return res.status(403).json({ message: 'Forbidden. Invalid service token.' });
    }

    next();
};