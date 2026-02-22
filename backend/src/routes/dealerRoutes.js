import express from 'express';
import {
    createDealer,
    getAllDealers,
    getDealerById,
    updateDealer,
    toggleDealerStatus,
    deleteDealer,
    assignBookToDealer,
    bulkAssignBooksToDealer,
    removeBookFromDealer,
    getDealerBooks,
    getMyBooks
} from '../controllers/dealerController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/books', verifyToken, getMyBooks);

router.post('/', verifyToken, isAdmin, createDealer);
router.get('/', verifyToken, isAdmin, getAllDealers);
router.get('/:id', verifyToken, isAdmin, getDealerById);
router.put('/:id', verifyToken, isAdmin, updateDealer);
router.patch('/:id/status', verifyToken, isAdmin, toggleDealerStatus);
router.delete('/:id', verifyToken, isAdmin, deleteDealer);

router.post('/:dealerId/books', verifyToken, isAdmin, assignBookToDealer);
router.post('/:dealerId/books/bulk', verifyToken, isAdmin, bulkAssignBooksToDealer);
router.delete('/:dealerId/books/:bookId', verifyToken, isAdmin, removeBookFromDealer);
router.get('/:dealerId/books', verifyToken, isAdmin, getDealerBooks);

export default router;
