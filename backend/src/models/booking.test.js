import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import bookingRoutes from '../routes/bookingRoutes.js';
import pg from 'pg';

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('Booking API Endpoints', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('should successfully create a new booking', async () => {
    const queryMock = mock.method(pg.Pool.prototype, 'query');
    queryMock.mock.mockImplementationOnce(async () => ({
      rows: [{ booking_id: 1, status: 'Pending' }],
    }));

    const response = await request(app).post('/api/bookings').send({
      homestayID: 5,
      guestID: 2,
      checkInDate: '2026-07-01',
      checkOutDate: '2026-07-05'
    });

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.message, 'Booking successfully created.');
    assert.strictEqual(queryMock.mock.callCount(), 1);
  });

  it('should successfully cancel an existing booking', async () => {
    const queryMock = mock.method(pg.Pool.prototype, 'query');
    queryMock.mock.mockImplementationOnce(async () => ({
      rowCount: 1,
      rows: [{ booking_id: 1, status: 'cancelled' }],
    }));

    const response = await request(app).put('/api/bookings/1/cancel');

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.message, 'Booking cancelled successfully.');
    assert.strictEqual(response.body.booking.status, 'cancelled');
  });

  it('should return a 404 if trying to cancel a booking that does not exist', async () => {
    const queryMock = mock.method(pg.Pool.prototype, 'query');
    queryMock.mock.mockImplementationOnce(async () => ({
      rowCount: 0,
      rows: []
    }));

    const response = await request(app).put('/api/bookings/999/cancel');

    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.message, 'Booking not found or cannot be cancelled.');
  });
});