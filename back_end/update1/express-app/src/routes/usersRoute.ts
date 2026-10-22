import express, { Router } from 'express';
import { usersRegisterPostController, usersLoginPostController, usersGetAllController, usersGetSpecificController, usersPutController, usersDeleteController } from '../controllers/usersController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import upload from '../middlewares/uploadMiddleware.ts';

const usersRoute: Router = express.Router();

// Create | Post
// Register
usersRoute.post('/register', upload.single('profile_picture'), usersRegisterPostController);

// Login
usersRoute.post('/login', usersLoginPostController);

// Read | Get
// Get All
usersRoute.get('/', authMiddleware, usersGetAllController);

// Get Specific
usersRoute.get('/:userId', authMiddleware, usersGetSpecificController);

// Update | Put
usersRoute.put('/:userId', authMiddleware, upload.single('profile_picture'), usersPutController);

// Delete | Delete
usersRoute.delete('/:usersId', authMiddleware, usersDeleteController);

export default usersRoute;