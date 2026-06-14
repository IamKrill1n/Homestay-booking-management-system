import pool from "../db/pool.js";

function mapRowToFeedback(row) {
  if (!row) return null;

  const guestName = [row.first_name, row.last_name].filter(Boolean).join(" ");

  return {
    feedbackID: row.feedback_id,
    bookingID: row.booking_id,
    homestayID: row.homestay_id,
    guestID: row.guest_id,
    guestName,
    rating: Number(row.rating),
    feedbackDate: row.feedback_date,
    feedbackMessage: row.feedback_message,
  };
}

export async function findFeedbackByHomestayId(homestayID) {
  const { rows } = await pool.query(
    `SELECT f.*, u.first_name, u.last_name
     FROM feedbacks f
     JOIN users u ON u.user_id = f.guest_id
     WHERE f.homestay_id = $1
     ORDER BY f.feedback_date DESC`,
    [homestayID]
  );
  return rows.map(mapRowToFeedback);
}

export async function findFeedbackByBookingId(bookingID) {
  const { rows } = await pool.query(
    `SELECT f.*, u.first_name, u.last_name
     FROM feedbacks f
     JOIN users u ON u.user_id = f.guest_id
     WHERE f.booking_id = $1`,
    [bookingID]
  );
  return rows.length ? mapRowToFeedback(rows[0]) : null;
}

export async function addFeedback({ bookingID, guestID, rating, feedbackMessage }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookingResult = await client.query(
      `SELECT booking_id, homestay_id, guest_id, check_out_date, status
       FROM bookings
       WHERE booking_id = $1 AND guest_id = $2`,
      [bookingID, guestID]
    );

    if (!bookingResult.rows.length) {
      await client.query("ROLLBACK");
      return { valid: false, statusCode: 404, message: "Booking not found." };
    }

    const booking = bookingResult.rows[0];
    const status = String(booking.status).toLowerCase();
    const checkoutHasPassed = new Date(booking.check_out_date) <= new Date();

    if (status === "cancelled") {
      await client.query("ROLLBACK");
      return { valid: false, statusCode: 400, message: "Cancelled bookings cannot receive feedback." };
    }

    if (status !== "completed" && !checkoutHasPassed) {
      await client.query("ROLLBACK");
      return { valid: false, statusCode: 400, message: "Feedback is only available after the stay." };
    }

    const existing = await client.query(
      `SELECT feedback_id FROM feedbacks WHERE booking_id = $1`,
      [bookingID]
    );

    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return { valid: false, statusCode: 409, message: "Feedback already exists for this booking." };
    }

    const { rows } = await client.query(
      `INSERT INTO feedbacks (booking_id, homestay_id, guest_id, rating, feedback_message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bookingID, booking.homestay_id, guestID, rating, feedbackMessage]
    );

    await client.query("COMMIT");

    return {
      valid: true,
      statusCode: 201,
      message: "Feedback submitted successfully.",
      feedback: mapRowToFeedback(rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeFeedback(feedbackID, guestID) {
  const { rows } = await pool.query(
    `DELETE FROM feedbacks
     WHERE feedback_id = $1 AND guest_id = $2
     RETURNING *`,
    [feedbackID, guestID]
  );
  return rows.length ? mapRowToFeedback(rows[0]) : null;
}
