import pg from 'pg';
import { M_Transaction } from '../models/M_Transaction.js';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class C_Transaction { 
  
  // --------------------------------------------------------
  // 1. MAKE TRANSACTION (Guest pays platform)
  // --------------------------------------------------------
  async createTransaction(req, res) { 
    try { 
      const { bookingID, bookingId, amount, paymentMethod } = req.body; 
      const finalBookingID = bookingID || bookingId;

      if (!finalBookingID || !amount || amount <= 0 || !paymentMethod) { 
        return res.status(400).json({ 
          status: "error", 
          error: "Missing required payment details.", 
          message: "bookingID, a positive amount, and paymentMethod are required." 
        }); 
      } 

      const transaction = new M_Transaction(0, finalBookingID, Number(amount), paymentMethod); 

      // Insert transaction (Using strict lowercase 'success' to match schema)
      const result = await pool.query(
        `INSERT INTO transactions (booking_id, amount, payment_method, status)
         VALUES ($1, $2, $3, 'success') RETURNING *`,
        [transaction.bookingID, transaction.amount, transaction.paymentMethod]
      );
  
      const savedTransaction = result.rows[0];
      transaction.transactionID = savedTransaction.transaction_id;
      transaction.status = savedTransaction.status;

      // Update booking status (Using strict lowercase 'confirmed')
      await pool.query(
        `UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1`,
        [transaction.bookingID]
      );

      const receipt = transaction.generateReceipt(); 

      return res.status(201).json({ 
        status: "success", 
        message: "Payment processed successfully.", 
        transaction: savedTransaction, 
        receipt: receipt, 
      }); 

    } catch (error) { 
      console.error("Controller Exception in createTransaction:", error); 
      return res.status(500).json({ 
        status: "error", 
        error: "Failed to process payment.", 
        message: "An internal server error occurred while processing payment." 
      }); 
    } 
  }

  // --------------------------------------------------------
  // 2. AUTOMATED REFUND (Referee calculates cut and cancels)
  // --------------------------------------------------------
  async cancelAndRefundBooking(req, res) {
    try {
      const { bookingID, bookingId } = req.body;
      const finalBookingID = bookingID || bookingId;

      // Fetch booking details AND the homestay's policy in one query
      const bookingQuery = await pool.query(`
        SELECT b.total_price, b.status, b.check_in_date, h.cancellation_policy 
        FROM bookings b
        JOIN homestays h ON b.homestay_id = h.homestay_id
        WHERE b.booking_id = $1
      `, [finalBookingID]);

      if (bookingQuery.rows.length === 0) {
        return res.status(404).json({ status: "error", error: "Booking not found." });
      }

      const booking = bookingQuery.rows[0];

      if (booking.status !== 'confirmed') {
        return res.status(400).json({ status: "error", error: "Only confirmed bookings can be cancelled/refunded." });
      }

      // Time math
      const now = new Date();
      const checkInDate = new Date(booking.check_in_date);
      const timeDiff = checkInDate.getTime() - now.getTime();
      const daysUntilCheckIn = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Calculate refund percentage
      let refundPercentage = 0;
      const policy = booking.cancellation_policy;

      if (policy === 'flexible' && daysUntilCheckIn >= 1) refundPercentage = 1.0;
      else if (policy === 'moderate') {
        if (daysUntilCheckIn >= 5) refundPercentage = 1.0;
        else if (daysUntilCheckIn >= 2) refundPercentage = 0.5;
      } 
      else if (policy === 'strict' && daysUntilCheckIn >= 7) refundPercentage = 0.5;

      const refundAmount = Number(booking.total_price) * refundPercentage;

      // Update Database: Cancel booking
      await pool.query(
        `UPDATE bookings SET status = 'cancelled' WHERE booking_id = $1`,
        [finalBookingID]
      );

      // Update Database: Log refund transaction if money is owed
      let savedRefund = null;
      if (refundAmount > 0) {
        const refundTxn = await pool.query(
          `INSERT INTO transactions (booking_id, amount, payment_method, status)
           VALUES ($1, $2, 'System Refund', 'refunded') RETURNING *`,
          [finalBookingID, refundAmount]
        );
        savedRefund = refundTxn.rows[0];
      }

      return res.status(200).json({
        status: "success",
        message: "Booking cancelled successfully.",
        policyApplied: policy,
        refundedAmount: refundAmount,
        transaction: savedRefund
      });

    } catch (error) {
      console.error("Controller Exception in cancelAndRefundBooking:", error);
      return res.status(500).json({ status: "error", error: "Failed to process cancellation." });
    }
  }

  // --------------------------------------------------------
  // 3. HOST PAYOUT (Platform pays the Owner)
  // --------------------------------------------------------
  async processHostPayout(req, res) {
    try {
      const { bookingID, bookingId } = req.body;
      const finalBookingID = bookingID || bookingId;

      // Fetch booking, owner ID, and bank details
      const payoutQuery = await pool.query(`
        SELECT b.total_price, b.status, h.owner_id, o.bank_account_number 
        FROM bookings b
        JOIN homestays h ON b.homestay_id = h.homestay_id
        JOIN owners o ON h.owner_id = o.owner_id
        WHERE b.booking_id = $1
      `, [finalBookingID]);

      if (payoutQuery.rows.length === 0) {
        return res.status(404).json({ status: "error", error: "Booking/Owner data not found." });
      }

      const data = payoutQuery.rows[0];

      // Payouts should only happen for successful stays
      if (data.status !== 'completed' && data.status !== 'confirmed') {
        return res.status(400).json({ status: "error", error: "Booking is not eligible for a payout yet." });
      }

      // Calculate the host's cut (Platform takes 10%)
      const platformFeePercentage = 0.10;
      const hostCut = Number(data.total_price) * (1 - platformFeePercentage);

      // Simulate sending money to data.bank_account_number
      // If successful, log it in the payouts table
      const newPayout = await pool.query(
        `INSERT INTO payouts (booking_id, owner_id, amount, status, payout_date)
         VALUES ($1, $2, $3, 'completed', NOW()) RETURNING *`,
        [finalBookingID, data.owner_id, hostCut]
      );

      return res.status(201).json({
        status: "success",
        message: "Payout transferred to owner successfully.",
        payoutDetails: newPayout.rows[0]
      });

    } catch (error) {
      console.error("Controller Exception in processHostPayout:", error);
      return res.status(500).json({ status: "error", error: "Failed to process payout." });
    }
  }

} 

export default new C_Transaction();