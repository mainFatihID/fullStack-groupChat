// Packages
import {type Request, type Response} from 'express';
import { StatusCodes } from 'http-status-codes';

// Files
import pool from '../db/index.ts';

// Create | Post
export const messagesPostController = async (req: Request, res: Response) => {
  try {
    const { sender_id, room_id, content } = req.body;

    const [membership]: any = await pool.query(
      'SELECT * FROM tb_group_members WHERE user_id - ? AND group_id = ?',
      [sender_id, room_id]
    );

    if (!membership || membership.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied: You are not a member of this group.'
      });
    }

    const [result]: any = await pool.query(
      'INSERT INTO tb_messages (sender_id, room_id, content) VALUES (?, ?, ?)',
      [sender_id, room_id, content]
    );

    res.status(StatusCodes.CREATED).json({
      message   : 'Message sent successfully.',
      memberId   : result.insertId
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Read | Get
// Get All
export const messagesGetAllController = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, sender_id, room_id, content FROM tb_messages'
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Get Specific
export const messagesGetSpecificController = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const [rows] = await pool.query(
      'SELECT sender_id, room_id, content FROM tb_messages WHERE room_id = ?',
      [groupId]
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Update | Put
export const messagesPutController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const [result]: any = await pool.query(
      'UPDATE tb_messages SET content = ? WHERE id = ?',
      [content, id]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'Content not found'});
      return;
    }

    res.status(StatusCodes.OK).json({message: 'Chat changed successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: (error as Error).message
    });
  }
};

// Delete | Delete
export const messagesDeleteController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const [result]: any = await pool.query(
      'DELETE FROM tb_messages WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'Chat not found'});
      return;
    } 

    res.json({message: 'Content deleted successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};