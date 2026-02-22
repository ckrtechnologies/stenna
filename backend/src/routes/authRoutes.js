import express from 'express';
import { login, logout, me, register, googleLogin } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/logout', logout);
router.get('/me', verifyToken, me);

export default router;
