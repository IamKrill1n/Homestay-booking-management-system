import express from 'express';
import { createTransaction } from '../controllers/TransactionController';

const router = express.Router();

// When a POST request hits /api/transactions, run the payment logic
router.post('/', createTransaction);

export default router;