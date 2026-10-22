import express, { Router } from 'express';

import { groupMembersPostController, groupMembersGetAllController, groupMembersGetSpecificController, groupMembersPutController, groupMembersDeleteController } from '../controllers/groupMembersController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { adminMiddleware } from '../middlewares/adminMiddleware.ts';

const groupMembersRoute: Router = express.Router();

// Create | Post
groupMembersRoute.post('/', authMiddleware, adminMiddleware, groupMembersPostController);

// Read | Get
// From All Group
groupMembersRoute.get('/', groupMembersGetAllController);

// From Specific Group
groupMembersRoute.get('/:groupMembersId', groupMembersGetSpecificController);

// Update | Put
groupMembersRoute.put('/:groupMembersId', authMiddleware, adminMiddleware, groupMembersPutController);

// Delete | Delete
groupMembersRoute.delete('/:groupMembersId', authMiddleware, adminMiddleware, groupMembersDeleteController);

export default groupMembersRoute;