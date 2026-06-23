import { M_Booking } from "../models/M_Booking.js";
import pg from 'pg'; 

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class C_Booking {
  
  // 1. Create a new booking (Includes overlap check & secure math)
  async createBooking(req, res) {
    try {
      const fieldList = {
        homestayID: req.body.homestayID ?? req.body.homestayId,
        guestID: req.body.guestID ?? req.body.guestId,
        numberOfGuests: req.body.numberOfGuests,
        checkInDate: req.body.checkInDate ?? req.body.checkIn,
        checkOutDate: req.body.checkOutDate ?? req.body.checkOut,
        status: "pending", 
      };

      const validation = M_Booking.validateBooking(fieldList);
      if (!validation.valid) {
        return res.status(400).json({ 
          status: "error", 
          message: validation.message 
        });
      }

      // 2. Fetch the new time columns alongside the rate
      const homestayQuery = await pool.query(
        `SELECT rental_type, price_per_hour, check_in_time, check_out_time 
         FROM homestays WHERE homestay_id = $1`,
        [fieldList.homestayID]
      );

      if (homestayQuery.rows.length === 0) {
        return res.status(404).json({ status: "error", message: "Homestay not found." });
      }
      const homestay = homestayQuery.rows[0];

      // 3. THE MAGIC: Forcefully apply the owner's times for daily stays
      if (homestay.rental_type === 'daily') {
        fieldList.checkInDate = `${req.body.checkInDate}T${homestay.check_in_time}`;
        fieldList.checkOutDate = `${req.body.checkOutDate}T${homestay.check_out_time}`;
      }

      const overlapQuery = await pool.query(
        `SELECT booking_id FROM bookings 
         WHERE homestay_id = $1 
           AND status IN ('confirmed', 'completed')
           AND check_in_date < $3 
           AND check_out_date > $2`,
        [fieldList.homestayID, fieldList.checkInDate, fieldList.checkOutDate]
      );

      if (overlapQuery.rows.length > 0) {
        return res.status(409).json({ 
          status: "error", 
          message: "These dates are already booked by another guest." 
        });
      }

      const booking = new M_Booking(fieldList);
      booking.calculateAndSetTotalPrice(homestay.price_per_hour, homestay.rental_type);

      const createdBooking = await booking.bookHomestay();

      return res.status(201).json({
        status: "success",
        message: "Booking successfully created.",
        booking: createdBooking,
      });

    } catch (error) {
      console.error("Controller Exception in createBooking:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred while creating the booking.",
      });
    }
  }

  // 2. Fetch a user's booking history
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;
      const bookings = await new M_Booking().getBookHistory(userId);
      return res.status(200).json(bookings);
    } catch (error) {
      console.error("Controller Exception in getUserBookings:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch booking history.",
      });
    }
  }

  async getOwnerBookings(req, res) {
    try {
      const { ownerId } = req.params;
      const bookings = await new M_Booking().getOwnerBookings(ownerId);
      return res.status(200).json(bookings);
    } catch (error) {
      console.error("Controller Exception in getOwnerBookings:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch owner bookings.",
      });
    }
  }

  async approveBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const ownerID = req.body.ownerID ?? req.body.ownerId;

      if (!ownerID) {
        return res.status(400).json({
          status: "error",
          message: "ownerID is required.",
        });
      }

      const booking = await new M_Booking().approveBooking(bookingId, ownerID);
      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Pending booking not found for this owner.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Booking approved. Guest can now pay by bank transfer.",
        booking,
      });
    } catch (error) {
      console.error("Controller Exception in approveBooking:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to approve booking.",
      });
    }
  }

  async rejectBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const ownerID = req.body.ownerID ?? req.body.ownerId;

      if (!ownerID) {
        return res.status(400).json({
          status: "error",
          message: "ownerID is required.",
        });
      }

      const booking = await new M_Booking().rejectBooking(bookingId, ownerID);
      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Pending booking not found for this owner.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Booking rejected.",
        booking,
      });
    } catch (error) {
      console.error("Controller Exception in rejectBooking:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to reject booking.",
      });
    }
  }

  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await new M_Booking().cancelBooking(bookingId);

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Booking not found or cannot be cancelled.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Booking cancelled successfully.",
        booking,
      });
      
    } catch (error) {
      console.error("Controller Exception in cancelBooking:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred while cancelling the booking.",
      });
    }
  }

  // 4. Fetch unavailable dates for the frontend calendar
  async getUnavailableDates(req, res) {
    try {
      const { homestayId } = req.params;
          
      const query = await pool.query(`
        SELECT check_in_date, check_out_date 
        FROM bookings 
        WHERE homestay_id = $1 
          AND status IN ('confirmed', 'completed')
          AND check_out_date > NOW()
      `, [homestayId]);

      return res.status(200).json({
        status: "success",
        bookedRanges: query.rows
      });

    } catch (error) {
      console.error("Controller Exception in getUnavailableDates:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch availability."
      });
    }
  }
}

export default new C_Booking();