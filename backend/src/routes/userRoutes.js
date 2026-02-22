import express from 'express';
import { getAllUsers, getUserById, updateProfile, deleteUser } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateProfile);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;
