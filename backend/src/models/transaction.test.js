import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import transactionRoutes from '../routes/transactionRoutes.js';
import pg from 'pg';

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

describe('Transaction API Endpoints', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('should successfully process a payment and confirm the booking', async () => {
    // Bulletproof Node Mock: Count the calls manually
    let callCount = 0;
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {
      callCount++;
      if (callCount === 1) {
        return { rows: [{ transaction_id: 101, booking_id: 1, amount: 180, payment_method: 'Credit Card', status: 'Success' }] };
      }
      return { rowCount: 1 };
    });

    const response = await request(app).post('/api/transactions').send({
      bookingID: 1,
      amount: 180,
      paymentMethod: 'Credit Card'
    });

    assert.strictEqual(response.status, 201);
    assert.ok(response.body.receipt); 
    assert.strictEqual(queryMock.mock.callCount(), 2);
    assert.match(queryMock.mock.calls[1].arguments[0], /UPDATE bookings SET status/);
  });

  it('should reject the transaction if payment details are missing', async () => {
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {});

    const response = await request(app).post('/api/transactions').send({
      bookingID: 1,
    });

    assert.strictEqual(response.status, 400);
    // Updated to check for your teammate's error JSON pattern
    assert.ok(response.body.message || response.body.error); 
    assert.strictEqual(queryMock.mock.callCount(), 0);
  });

  it('should handle errors if the booking status fails to update', async () => {
    let callCount = 0;
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {
      callCount++;
      if (callCount === 1) {
        return { rows: [{ transaction_id: 101 }] };
      }
      throw new Error('Database connection lost');
    });

    const response = await request(app).post('/api/transactions').send({
      bookingID: 999,
      amount: 180,
      paymentMethod: 'PayPal'
    });

    assert.strictEqual(response.status, 500);
    assert.ok(response.body.message || response.body.error);
  });
});