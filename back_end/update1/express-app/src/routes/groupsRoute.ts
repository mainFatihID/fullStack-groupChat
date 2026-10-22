import express, { Router } from 'express';
import { groupsPostController, groupsGetAllController, groupsGetSpecificController, groupsPutController, groupsDeleteController } from '../controllers/groupsController.ts';

const groupsRoute: Router = express.Router();

// Create | Post
groupsRoute.post('/', groupsPostController);

// Read | Get
// Get All
groupsRoute.get('/', groupsGetAllController);

// Get Specific
// Add this under Read | Get in groupsRoute.ts
groupsRoute.get('/:groupId', groupsGetSpecificController);

// Update | Put
groupsRoute.put('/:groupId', groupsPutController);

// Delete | Delete
groupsRoute.delete('/:groupId', groupsDeleteController);

export default groupsRoute;