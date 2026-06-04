import express from 'express';
import { getAllUsers, getUserById, updateProfile, deleteUser, getUserCredits } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/profile/credits', verifyToken, getUserCredits);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateProfile);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;
