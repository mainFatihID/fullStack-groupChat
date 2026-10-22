import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import pool from '../db/index.ts';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Unauthorized. Please login first.'
            });
        }

        const userId = req.user.id;
        const groupId = req.params.groupId || req.body.group_id;

        const [result]: any = await pool.query(
            'SELECT user_id, group_id, role FROM tb_group_members WHERE user_id = ? AND group_id = ? AND role = ?',
            [userId, groupId, 'admin']
        );

        if (result.length === 0) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Non-admin users are prohibited from modifying group.'
            });
        }
        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error in admin middleware.',
            error: (error as Error).message
        });
    }
}