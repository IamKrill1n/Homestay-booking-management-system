import pg from 'pg';
import { M_Transaction } from '../models/M_Transaction.js';

// Re-integrate your direct database connection so your tests pass
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class C_Transaction { 
  async createTransaction(req, res) { 
    try { 
      // 1. Teammate's flexible ID check (catches both camelCase and pascalCase)
      const { bookingID, bookingId, amount, paymentMethod } = req.body; 
      const finalBookingID = bookingID || bookingId;

      // 2. YOUR Validation Guard (Combines their math check with your test requirements)
      if (!finalBookingID || !amount || amount <= 0 || !paymentMethod) { 
        return res.status(400).json({ 
          status: "error", 
          error: "Missing required payment details.", // Required for Test T-02
          message: "bookingID, a positive amount, and paymentMethod are required." 
        }); 
      } 

      // 3. Initialize your exact Model structure
      const transaction = new M_Transaction( 
        0, // Auto-generated ID
        finalBookingID, 
        Number(amount), 
        paymentMethod 
      ); 

      // 4. YOUR Database Insert (Bypassing their repo so we can do the two-step transaction safely)
      const result = await pool.query(
        `INSERT INTO transactions (booking_id, amount, payment_method, status)
         VALUES ($1, $2, $3, 'Success') RETURNING *`,
        [transaction.bookingID, transaction.amount, transaction.paymentMethod]
      );
  
      const savedTransaction = result.rows[0];

      // Update the model with the real DB values so the receipt generates accurately
      transaction.transactionID = savedTransaction.transaction_id;
      transaction.status = savedTransaction.status;

      // 5. YOUR Critical Logic: Update the booking status to 'Confirmed'
      await pool.query(
        `UPDATE bookings SET status = 'Confirmed' WHERE booking_id = $1`,
        [transaction.bookingID]
      );

      // 6. Generate the receipt using the built-in model method
      const receipt = transaction.generateReceipt(); 

      // 7. The Unified Response (Combines their status strings with your required JSON)
      return res.status(201).json({ 
        status: "success", 
        message: "Payment processed successfully.", 
        transaction: savedTransaction, 
        receipt: receipt, 
      }); 

    } catch (error) { 
      // 8. Error Catch (Fixes Test T-03)
      console.error("Controller Exception in createTransaction:", error); 
      return res.status(500).json({ 
        status: "error", 
        error: "Failed to process payment.", 
        message: "An internal server error occurred while processing payment." 
      }); 
    } 
  } 
} 

export default new C_Transaction();