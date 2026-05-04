import express from 'express';
import {
    getAllGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkAddWallpapersToGroup
} from '../controllers/groupController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.post('/', verifyToken, isAdmin, createGroup);
router.post('/wallpapers/bulk', verifyToken, isAdmin, bulkAddWallpapersToGroup);
router.post('/:id/wallpapers/bulk', verifyToken, isAdmin, bulkAddWallpapersToGroup);
router.put('/:id', verifyToken, isAdmin, updateGroup);
router.delete('/:id', verifyToken, isAdmin, deleteGroup);

export default router;
