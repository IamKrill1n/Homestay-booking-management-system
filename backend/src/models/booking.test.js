// 1. Set environment variable BEFORE anything else
process.env.DATABASE_URL = 'postgres://fakeuser:fakepassword@localhost:5432/fakedb';

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import pg from 'pg';

// 2. Bypass import hoisting
const { default: bookingRoutes } = await import('../routes/bookingRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('Booking API Endpoints', () => {
  beforeEach(() => {
    mock.restoreAll();
    
    // THE KILL SWITCH: Completely disable real database connections
    mock.method(pg.Pool.prototype, 'connect', async () => ({
      query: mock.fn(async () => ({ rows: [{ booking_id: 1, status: 'pending', total_price: 1500000 }] })),
      release: mock.fn()
    }));
  });

  it('should return 400 if required booking fields are missing', async () => {
    const response = await request(app).post('/api/bookings').send({
      homestayID: 5,
    });
    assert.strictEqual(response.status, 400);
    assert.match(response.body.message, /Missing required field/);
  });

  it('should successfully create a new daily booking with strict time rules', async () => {
    let callCount = 0;
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {
      callCount++;
      if (callCount === 1) return { rows: [{ rental_type: 'daily', price_per_hour: 500000, check_in_time: '14:00:00', check_out_time: '10:00:00' }] };
      if (callCount === 2) return { rows: [] }; // Overlap check passes
      return { rows: [{ booking_id: 1, status: 'pending', total_price: 1500000 }] };
    });

    const response = await request(app).post('/api/bookings').send({
      homestayID: 5, guestID: 2, numberOfGuests: 1, checkInDate: '2026-07-01', checkOutDate: '2026-07-04'
    });

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.message, 'Booking successfully created.');
  });

  it('should return 409 if dates overlap with an existing booking', async () => {
    let callCount = 0;
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {
      callCount++;
      if (callCount === 1) return { rows: [{ rental_type: 'hourly', price_per_hour: 100000 }] };
      if (callCount === 2) return { rows: [{ booking_id: 88 }] }; // Conflict!
      return { rows: [] };
    });

    const response = await request(app).post('/api/bookings').send({
      homestayID: 5, guestID: 2, numberOfGuests: 2, checkInDate: '2026-07-01T10:00:00', checkOutDate: '2026-07-01T15:00:00'
    });

    assert.strictEqual(response.status, 409);
  });

  it('should successfully fetch unavailable dates for the frontend calendar', async () => {
    mock.method(pg.Pool.prototype, 'query', async () => ({
      rows: [{ check_in_date: '2026-08-01T14:00:00Z', check_out_date: '2026-08-05T10:00:00Z' }]
    }));
    const response = await request(app).get('/api/bookings/homestay/5/availability');
    assert.strictEqual(response.status, 200);
  });

  it('should successfully cancel an existing booking', async () => {
    mock.method(pg.Pool.prototype, 'query', async () => ({
      rowCount: 1, rows: [{ booking_id: 1, status: 'cancelled' }]
    }));
    const response = await request(app).put('/api/bookings/1/cancel');
    assert.strictEqual(response.status, 200);
  });

  it('should return a 404 if trying to cancel a booking that does not exist', async () => {
    mock.method(pg.Pool.prototype, 'query', async () => ({
      rowCount: 0, rows: []
    }));
    const response = await request(app).put('/api/bookings/999/cancel');
    assert.strictEqual(response.status, 404);
  });
});