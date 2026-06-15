import request from 'supertest';
import express from 'express';
import transactionRoutes from '../routes/transactionRoutes';
import { Pool } from 'pg';

// 1. MOCK THE DATABASE: Critical so we don't alter real PostgreSQL data
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// 2. SETUP TEST SERVER
const app = express();
app.use(express.json());
// Mount the routes exactly as they are in your main app
app.use('/api/transactions', transactionRoutes);

describe('Transaction API Endpoints', () => {
  let pool: any;

  beforeEach(() => {
    pool = new Pool();
    jest.clearAllMocks();
  });

  // --- TEST CASE T-01: Happy Path ---
  it('should successfully process a payment and confirm the booking', async () => {
    // We need to mock TWO database calls in a row here!
    // 1st Call: Inserting the transaction
    pool.query.mockResolvedValueOnce({
      rows: [{ transaction_id: 101, booking_id: 1, amount: 180, payment_method: 'Credit Card' }],
    });
    // 2nd Call: Updating the booking status to 'Confirmed'
    pool.query.mockResolvedValueOnce({
      rowCount: 1, 
    });

    const response = await request(app)
      .post('/api/transactions')
      .send({
        bookingID: 1,
        amount: 180,
        paymentMethod: 'Credit Card'
      });

    // Verify the API response
    expect(response.status).toBe(201); // Or 200, depending on your controller's exact success code
    expect(response.body).toHaveProperty('receipt');
    
    // Verify the database was called exactly twice
    expect(pool.query).toHaveBeenCalledTimes(2);
    
    // Check that the second database call was the UPDATE statement
    expect(pool.query.mock.calls[1][0]).toContain('UPDATE bookings SET status');
  });

  // --- TEST CASE T-02: Missing Data ---
  it('should reject the transaction if payment details are missing', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .send({
        bookingID: 1,
        // Missing amount and payment method!
      });

    expect(response.status).toBe(400); // 400 means "Bad Request"
    expect(response.body.error).toBeDefined();
    expect(pool.query).not.toHaveBeenCalled(); // The DB should never be touched!
  });

  // --- TEST CASE T-03: Booking Update Fails ---
  it('should handle errors if the booking status fails to update', async () => {
    // 1st Call: Transaction inserts successfully
    pool.query.mockResolvedValueOnce({
      rows: [{ transaction_id: 101 }],
    });
    // 2nd Call: The UPDATE query unexpectedly fails (e.g., booking doesn't exist)
    pool.query.mockRejectedValueOnce(new Error('Database connection lost'));

    const response = await request(app)
      .post('/api/transactions')
      .send({
        bookingID: 999,
        amount: 180,
        paymentMethod: 'PayPal'
      });

    expect(response.status).toBe(500); // 500 means "Internal Server Error"
    expect(response.body.error).toBeDefined();
  });
});