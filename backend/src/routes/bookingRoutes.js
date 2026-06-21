import { Router } from "express";
import C_Booking from "../controllers/C_Booking.js";

const router = Router();

router.post("/", C_Booking.createBooking);
router.get("/user/:userId", C_Booking.getUserBookings);
router.put("/:bookingId/cancel", C_Booking.cancelBooking);
router.get("/homestay/:homestayId/availability", C_Booking.getUnavailableDates);

export default router;
