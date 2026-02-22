import express from 'express';
import { getStoreInfo, updateStoreInfo } from '../controllers/storeController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getStoreInfo);
router.put('/', verifyToken, isAdmin, updateStoreInfo);

export default router;
