import express, { Router } from 'express';
import { messagesPostController, messagesGetAllController, messagesGetSpecificController, messagesPutController, messagesDeleteController } from '../controllers/messagesController.ts';

const messagesRoute: Router = express.Router();

// Create | Post
messagesRoute.post('/', messagesPostController);

// Read | Get
// Get All
messagesRoute.get('/', messagesGetAllController);

// Get Specific
messagesRoute.get('/:groupId', messagesGetSpecificController);

// Update | Put
messagesRoute.put('/:groupId', messagesPutController);

// Delete | Delete
messagesRoute.delete('/:groupId', messagesDeleteController);

export default messagesRoute;