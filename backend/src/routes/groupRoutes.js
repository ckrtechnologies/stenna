import express from 'express';
import {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup
} from '../controllers/groupController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.post('/', verifyToken, isAdmin, createGroup);
router.put('/:id', verifyToken, isAdmin, updateGroup);
router.delete('/:id', verifyToken, isAdmin, deleteGroup);

export default router;
