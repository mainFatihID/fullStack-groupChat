// Packages
import {type Request, type Response} from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Files
import pool from '../db/index.ts';
import { registerSchema } from '../middlewares/validationMiddleware.ts';

// Create | Post
// Register
export const usersRegisterPostController = async (req: Request, res: Response) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Validation failed',
        details: validationResult.error.format()
      });
    }

    const {username, email, password_hash} = validationResult.data;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password_hash, saltRounds);
    
    const profile_picture = req.file ? req.file.path : null;

    const [result]: any = await pool.query (
      'INSERT INTO tb_users (username, email, password_hash, profile_picture) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, profile_picture]
    );

    res.status(StatusCodes.CREATED).json({
      message   : 'User created successfully',
      userId    : result.insertId
    });

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Login
export const usersLoginPostController = async (req: Request, res: Response) => {
  try {
    const identifier = req.body?.email || req.body?.username || req.body?.identifier;
    const password_hash = req.body?.password_hash;

    if (!identifier || !password_hash) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Login failed! Email or username and password must be entered.'
      });
    }

    const [users] : any = await pool.execute(
      'SELECT * FROM tb_users WHERE email = ? OR username = ?',
      [identifier, identifier]
    );

    if (!users || users.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Incorrect Email or Password'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);

    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Incorrect password.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Configuration error: JWT secret is not defined on the server.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: users[0].email, username: users[0].username },
      jwtSecret,
      { expiresIn: '1h' }
    )

    return res.status(StatusCodes.OK).json({
      message: 'User login successfully.',
      token: token
    })
  } catch (error) {
    console.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Uh, sorry! The internal server is experiencing an issue or error.'
    });
  }
};

// Read | Get
// Get All
export const usersGetAllController = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, profile_picture, created_at FROM tb_users');
    
    res.json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Get Specific
export const usersGetSpecificController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query('SELECT username, email, profile_picture, created_at FROM tb_users WHERE id = ?',
    [userId]
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Update | Put
export const usersPutController = async (req: Request, res: Response) => {
  try {
    const {usersId} = req.params;
    const {username} = req.body;

    const profile_picture = req.file ? req.file.path : null;

    const [result]: any = await pool.query(
      'UPDATE tb_users SET username = ?, profile_picture = ? WHERE id = ?',
      [username, profile_picture, usersId]
    );

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({error: 'User not found'});
    } 

    return res.json({
      message: 'User updated successfully',
      profile_picture: profile_picture
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};

// Delete | Delete
export const usersDeleteController = async (req: Request, res: Response) => {
  try {
    const {usersId} = req.params;
    const [result]: any = await pool.query(
      'DELETE FROM tb_users WHERE id = ?',
      [usersId]
    );

    if (result.affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({error: 'User not found'});
      return;
    } 

    res.json({message: 'User deleted successfully'});
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error     : (error as Error).message
    });
  }
};