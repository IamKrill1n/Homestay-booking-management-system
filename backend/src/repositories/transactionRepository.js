import pool from "../db/pool.js";

function mapRow(row) {
  if (!row) return null;

  return {
    transactionID: row.transaction_id,
    bookingID: row.booking_id,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    transactionDate: row.transaction_date,
    status: row.status,
  };
}

export async function createTransaction(transaction) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO transactions (booking_id, amount, payment_method, status)
       VALUES ($1, $2, $3, 'confirmed')
       RETURNING *`,
      [transaction.bookingID, transaction.amount, transaction.paymentMethod]
    );

    await client.query(
      `UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1`,
      [transaction.bookingID]
    );

    await client.query("COMMIT");
    return mapRow(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
