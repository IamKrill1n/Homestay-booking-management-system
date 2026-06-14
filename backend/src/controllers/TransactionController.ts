import { Request, Response } from 'express';
import { Pool } from 'pg';
import { M_Transaction } from '../models/M_Transaction';

// Connect to the database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { bookingID, amount, paymentMethod } = req.body;

    // 1. Create a new Transaction object using our model
    const newTransaction = new M_Transaction(
      0, // ID is auto-generated
      bookingID,
      amount,
      paymentMethod
    );

    const txnDetails = newTransaction.getTransactionDetails();

    // 2. Insert into the PostgreSQL database
    const result = await pool.query(
      `INSERT INTO transactions (booking_id, amount, payment_method, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        txnDetails.bookingID, 
        txnDetails.amount, 
        txnDetails.paymentMethod, 
        txnDetails.status
      ]
    );

    // 3. (Optional) Automatically update the booking status to "Confirmed"
    await pool.query(
      `UPDATE bookings SET status = 'Confirmed' WHERE booking_id = $1`,
      [txnDetails.bookingID]
    );

    // 4. Send the digital receipt back to the frontend
    res.status(201).json({
      message: 'Payment processed successfully!',
      transaction: result.rows[0],
      receipt: newTransaction.generateReceipt()
    });

  } catch (error) {
    console.error('Transaction Error:', error);
    res.status(500).json({ error: 'Failed to process payment.' });
  }
};