import pool from "../db/pool.js";

function mapRowToBooking(row) {
  if (!row) return null;

  return {
    bookingID   : row.booking_id, 
    homestayID  : row.homestay_id, 
    guestID     : row.guest_id, 
    checkInDate : row.check_in_date,
    checkOutDate: row.check_out_date,
    totalPrice  : row.total_price == null ? null : Number(row.total_price),
    status      : row.status,
    createdAt   : row.created_at,
    homestay: row.title
      ? {
          title: row.title,
          address: row.address ?? "",
          city: row.city ?? "",
        }
      : null,
    hasFeedback: Boolean(row.feedback_id),
  };
}

export async function createBooking(booking) {
  const { rows } = await pool.query(
    `INSERT INTO bookings (
       homestay_id, guest_id, check_in_date, check_out_date, total_price, status
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      booking.homestayID,
      booking.guestID,
      booking.checkInDate,
      booking.checkOutDate,
      booking.totalPrice,
      booking.status || "pending",
    ]
  );

  return mapRowToBooking(rows[0]);
}

export async function findBookingByGuestId(guestID) {
  const { rows } = await pool.query(
    `SELECT
       b.*,
       h.title,
       l.address,
       l.city,
       f.feedback_id
     FROM bookings b
     LEFT JOIN homestays h ON h.homestay_id = b.homestay_id
     LEFT JOIN locations l ON l.homestay_id = b.homestay_id
     LEFT JOIN feedbacks f ON f.booking_id = b.booking_id
     WHERE b.guest_id = $1
     ORDER BY b.booking_id DESC`,
    [guestID]
  );

  return rows.map(mapRowToBooking);
}

export async function cancelBookingById(bookingID) {
  const { rows } = await pool.query(
    `UPDATE bookings
     SET status = 'cancelled'
     WHERE booking_id = $1
       AND status = 'pending'
     RETURNING *`,
    [bookingID]
  );

  return rows.length ? mapRowToBooking(rows[0]) : null;
}
