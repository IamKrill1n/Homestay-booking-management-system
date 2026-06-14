import { M_Booking } from "../models/M_Booking.js";

class C_Booking {
  async createBooking(req, res) {
    try {
      const fieldList = {
        homestayID: req.body.homestayID ?? req.body.homestayId,
        guestID: req.body.guestID ?? req.body.guestId,
        checkInDate: req.body.checkInDate ?? req.body.checkIn,
        checkOutDate: req.body.checkOutDate ?? req.body.checkOut,
        totalPrice: req.body.totalPrice ?? null,
        status: "pending",
      };

      const validation = M_Booking.validateBooking(fieldList);
      if (!validation.valid) {
        return res.status(400).json({
          status: "error",
          message: validation.message,
        });
      }

      const booking = new M_Booking(fieldList);
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
}

export default new C_Booking();
