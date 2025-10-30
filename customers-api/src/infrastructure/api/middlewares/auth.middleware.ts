import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | any => {
    
    const authHeader = req.headers['authorization'];
    
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication required. Missing Authorization header.' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
        return res.status(401).json({ message: 'Authentication required. Invalid Authorization format (must be Bearer token).' });
    }
    const token = parts[1];
    
    try {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("Error: JWT_SECRET not configured.");
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        
        const decoded = jwt.verify(token as string, jwtSecret);
        
        req.user = decoded; 
        
        next();

    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};