import pool from "../db/pool.js";
import { M_Booking } from "../models/M_Booking.js"

function mapRowToBooking (row) {
  if (!row) return null;

  return new M_Booking({
    bookingID   : row.booking_id, 
    homestayID  : row.homestay_id, 
    guestID     : row.guest_id, 
    checkInDate : row.check_in_date,
    checkOutDate: row.check_out_date,
    status      : row.status
  });
}

export async function findBookingByGuestId (guestID) {
  const { rows } = await pool.query(
    `SELECT * FROM bookings WHERE guest_id = $1`,
    [guestID]
  );

  if (rows.length === 0) return [];

  return rows.map(mapRowToBooking);
}