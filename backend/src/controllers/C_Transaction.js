import { M_Transaction } from "../models/M_Transaction.js";
import * as transactionRepo from "../repositories/transactionRepository.js";

class C_Transaction {
  async createTransaction(req, res) {
    try {
      const { bookingID, bookingId, amount, paymentMethod } = req.body;
      const transaction = new M_Transaction({
        bookingID: bookingID ?? bookingId,
        amount: Number(amount),
        paymentMethod,
      });

      if (!transaction.bookingID || transaction.amount <= 0 || !transaction.paymentMethod) {
        return res.status(400).json({
          status: "error",
          message: "bookingID, a positive amount, and paymentMethod are required.",
        });
      }

      const createdTransaction = await transactionRepo.createTransaction(transaction);
      const receipt = new M_Transaction(createdTransaction).generateReceipt();

      return res.status(201).json({
        status: "success",
        message: "Payment processed successfully.",
        transaction: createdTransaction,
        receipt,
      });
    } catch (error) {
      console.error("Controller Exception in createTransaction:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred while processing payment.",
      });
    }
  }
}

export default new C_Transaction();
