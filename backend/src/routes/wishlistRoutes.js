import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getWishlist);
router.post('/', verifyToken, addToWishlist);
router.delete('/:id', verifyToken, removeFromWishlist);

export default router;
