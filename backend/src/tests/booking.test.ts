import request from 'supertest';
import express from 'express';
import bookingRoutes from '../routes/bookingRoutes';
import { Pool } from 'pg';

// 1. MOCK THE DATABASE: Prevent tests from touching real PostgreSQL data
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// 2. SETUP TEST SERVER: Create a mini Express app just for testing
const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('Booking API Endpoints', () => {
  let pool: any;

  beforeEach(() => {
    // Reset the database mock before every single test
    pool = new Pool();
    jest.clearAllMocks();
  });

  // --- TEST CASE B-01: Happy Path ---
  it('should successfully create a new booking', async () => {
    // Tell the fake database exactly what to return when asked
    pool.query.mockResolvedValueOnce({
      rows: [{ booking_id: 1, status: 'Pending' }],
    });

    const response = await request(app)
      .post('/api/bookings')
      .send({
        homestayID: 5,
        guestID: 2,
        checkInDate: '2026-07-01',
        checkOutDate: '2026-07-05'
      });

    // Verify the results!
    expect(response.status).toBe(201); // 201 means "Created"
    expect(response.body.message).toBe('Booking successfully created!');
    expect(pool.query).toHaveBeenCalledTimes(1); // Ensure DB was called
  });

  // --- TEST CASE B-03: Cancel Booking ---
  it('should successfully cancel an existing booking', async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ booking_id: 1, status: 'cancelled' }],
    });

    const response = await request(app)
      .put('/api/bookings/1/cancel');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Booking cancelled successfully.');
    expect(response.body.booking.status).toBe('cancelled');
  });

  // --- TEST CASE B-04: Error Handling ---
  it('should return a 404 if trying to cancel a booking that does not exist', async () => {
    // Mock the database returning 0 rows found
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const response = await request(app)
      .put('/api/bookings/999/cancel');

    expect(response.status).toBe(404); // 404 means "Not Found"
    expect(response.body.error).toBe('Booking not found.');
  });
});