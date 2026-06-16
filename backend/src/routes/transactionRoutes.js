import { Router } from "express";
import C_Transaction from "../controllers/C_Transaction.js";

const router = Router();

router.post('/', C_Transaction.createTransaction);
router.post('/pay', C_Transaction.createTransaction);
router.post('/refund', C_Transaction.cancelAndRefundBooking);
router.post('/payout', C_Transaction.processHostPayout);

export default router;
