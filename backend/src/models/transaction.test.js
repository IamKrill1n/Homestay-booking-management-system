// 1. Set environment variable BEFORE anything else
process.env.DATABASE_URL = 'postgres://fakeuser:fakepassword@localhost:5432/fakedb';

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import pg from 'pg';

// 2. Bypass import hoisting
const { default: transactionRoutes } = await import('../routes/transactionRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

describe('Transaction API Endpoints', () => {
  beforeEach(() => {
    mock.restoreAll();
    
    // Stop any rogue connections here too
    mock.method(pg.Pool.prototype, 'connect', async () => ({
      query: mock.fn(), release: mock.fn()
    }));
  });

  it('should successfully process a payment and confirm the booking', async () => {
    let callCount = 0;
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {
      callCount++;
      if (callCount === 1) return { rows: [{ transaction_id: 101, booking_id: 1, amount: 500000, payment_method: 'Credit Card', status: 'success' }] };
      return { rowCount: 1 }; // For the UPDATE query
    });

    const response = await request(app).post('/api/transactions/pay').send({
      bookingID: 1, amount: 500000, paymentMethod: 'Credit Card'
    });

    assert.strictEqual(response.status, 201);
    assert.ok(response.body.receipt); 
  });

  it('should reject the transaction if payment details are missing', async () => {
    const response = await request(app).post('/api/transactions/pay').send({
      bookingID: 1,
    });
    assert.strictEqual(response.status, 400);
  });

  it('should handle errors if the booking status fails to update', async () => {
    let callCount = 0;
    const queryMock = mock.method(pg.Pool.prototype, 'query', async () => {
      callCount++;
      if (callCount === 1) return { rows: [{ transaction_id: 101, booking_id: 999, amount: 500000, payment_method: 'PayPal', status: 'success' }] };
      throw new Error('Database connection lost');
    });

    const response = await request(app).post('/api/transactions/pay').send({
      bookingID: 999, amount: 500000, paymentMethod: 'PayPal'
    });

    assert.strictEqual(response.status, 500);
  });
});