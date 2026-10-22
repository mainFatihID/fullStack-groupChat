import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from 'jsonwebtoken';

export function authMiddleware (req: Request, res: Response, next: NextFunction) {
    if (!req.headers?.authorization) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'User is not logged in'
        });
    }

    const token : any = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Token format is incorrect or empty.'
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Configuration error: JWT secret is not defined on the server.'
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.user = decoded

        return next()
    } catch (error) {
        return res.status(StatusCodes.FORBIDDEN).json({
            message: 'User token is incorrect or empty.'
        });
    };
}