// Packages
import {type Request, type Response} from 'express';
import { StatusCodes } from 'http-status-codes';

// Files
import pool from '../db/index.ts';

// Create | Post
export const groupsPostController = async (req: Request, res: Response) => {
  try {
    const { group_name, created_by } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO tb_groups (group_name, created_by) VALUES (?, ?)',
      [group_name, created_by]
    );

    res.status(StatusCodes.CREATED).json({
      message   : 'Group created successfully',
      groupId   : result.insertId
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Read | Get
// Get All
export const groupsGetAllController = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, group_name, created_by, created_at FROM tb_groups'
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Get Specific
export const groupsGetSpecificController = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const [rows]: any = await pool.query(
      'SELECT id, group_name, created_by, created_at FROM tb_groups WHERE id = ?',
      [groupId]
    );

    if (!rows || rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Group not Found'
      });
    }

    res.status(StatusCodes.OK).json(rows)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Update | Put
export const groupsPutController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { group_name } = req.body;
    const [result]: any = await pool.query(
      'UPDATE tb_groups SET group_name = ? WHERE id = ?',
      [group_name, id]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'Group not found'});
      return;
    }

    res.status(StatusCodes.OK).json({message: 'Group updated successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Delete | Delete
export const groupsDeleteController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const [result]: any = await pool.query(
      'DELETE FROM tb_groups WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'Group not found'});
      return;
    } 

    res.json({message: 'Group deleted successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};