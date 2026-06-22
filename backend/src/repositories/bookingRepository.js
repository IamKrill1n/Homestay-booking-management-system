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
    guest: row.guest_first_name
      ? {
          firstName: row.guest_first_name,
          lastName: row.guest_last_name ?? "",
          email: row.guest_email ?? "",
          phoneNumber: row.guest_phone_number ?? "",
        }
      : null,
    hasFeedback: Boolean(row.feedback_id),
  };
}

function isBookingIdSequenceCollision(error) {
  return error?.code === "23505" && error?.constraint === "bookings_pkey";
}

async function syncBookingIdSequence() {
  await pool.query(
    `SELECT setval(
       'bookings_booking_id_seq',
       COALESCE((SELECT MAX(booking_id) FROM bookings), 1),
       (SELECT MAX(booking_id) FROM bookings) IS NOT NULL
     )`
  );
}

async function insertBooking(booking) {
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

export async function createBooking(booking) {
  try {
    return await insertBooking(booking);
  } catch (error) {
    if (!isBookingIdSequenceCollision(error)) {
      throw error;
    }

    await syncBookingIdSequence();
    return insertBooking(booking);
  }
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

export async function findBookingsByOwnerId(ownerID) {
  const { rows } = await pool.query(
    `SELECT
       b.*,
       h.title,
       l.address,
       l.city,
       u.first_name AS guest_first_name,
       u.last_name AS guest_last_name,
       u.email AS guest_email,
       u.phone_number AS guest_phone_number,
       f.feedback_id
     FROM bookings b
     JOIN homestays h ON h.homestay_id = b.homestay_id
     LEFT JOIN locations l ON l.homestay_id = b.homestay_id
     JOIN users u ON u.user_id = b.guest_id
     LEFT JOIN feedbacks f ON f.booking_id = b.booking_id
     WHERE h.owner_id = $1
     ORDER BY b.booking_id DESC`,
    [ownerID]
  );

  return rows.map(mapRowToBooking);
}

export async function updateOwnerBookingStatus(bookingID, ownerID, status) {
  const { rows } = await pool.query(
    `WITH updated AS (
       UPDATE bookings b
       SET status = $3
       FROM homestays h
       WHERE b.homestay_id = h.homestay_id
         AND b.booking_id = $1
         AND h.owner_id = $2
         AND b.status = 'pending'
       RETURNING b.*
     )
     SELECT
       updated.*,
       h.title,
       l.address,
       l.city,
       u.first_name AS guest_first_name,
       u.last_name AS guest_last_name,
       u.email AS guest_email,
       u.phone_number AS guest_phone_number,
       f.feedback_id
     FROM updated
     JOIN homestays h ON h.homestay_id = updated.homestay_id
     LEFT JOIN locations l ON l.homestay_id = updated.homestay_id
     JOIN users u ON u.user_id = updated.guest_id
     LEFT JOIN feedbacks f ON f.booking_id = updated.booking_id`,
    [bookingID, ownerID, status]
  );

  return rows.length ? mapRowToBooking(rows[0]) : null;
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
