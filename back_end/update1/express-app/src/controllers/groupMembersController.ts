// Packages
import {type Request, type Response} from 'express';
import { StatusCodes } from 'http-status-codes';

// Files
import pool from '../db/index.ts';

// Create | Post
export const groupMembersPostController = async (req: Request, res: Response) => {
  try {
    const { user_id, group_id, role } = req.body;

    const columns = ['user_id', 'group_id'];
    const values: any = [user_id, group_id];

    if (role !== undefined && role !== null && role !== '') {
      columns.push('role');
      values.push(role);
    }

    const placeholders = values.map(() => '?').join(', ');
    const query= `INSERT INTO tb_group_members (${columns.join(', ')}) VALUES (${placeholders})`;

    const [result]: any = await pool.query(query, values);

    res.status(StatusCodes.CREATED).json({
      message   : 'Member added successfully',
      memberId   : result.insertId
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Read | Get
// From All Group
export const groupMembersGetAllController = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, group_id, role FROM tb_group_members'
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// From Specific Group
export const groupMembersGetSpecificController = async (req: Request, res: Response) => {
  try {
    const { groupMembersId } = req.params;

    const [rows] = await pool.query(
      'SELECT user_id, group_id, role FROM tb_group_members WHERE group_id = ?',
      [groupMembersId]
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Update | Put
export const groupMembersPutController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const [result]: any = await pool.query(
      'UPDATE tb_group_members SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'Role not found'});
      return;
    }

    res.status(StatusCodes.OK).json({message: 'Role changed successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Delete | Delete
export const groupMembersDeleteController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const [result]: any = await pool.query(
      'DELETE FROM tb_group_members WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'Member not found'});
      return;
    } 

    res.json({message: 'Member kicked successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};