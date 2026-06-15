import { Router } from "express";
import C_Booking from "../controllers/C_Booking.js";

const router = Router();

router.post("/", C_Booking.createBooking);
router.get("/user/:userId", C_Booking.getUserBookings);
router.get("/owner/:ownerId", C_Booking.getOwnerBookings);
router.put("/:bookingId/approve", C_Booking.approveBooking);
router.put("/:bookingId/reject", C_Booking.rejectBooking);
router.put("/:bookingId/cancel", C_Booking.cancelBooking);

export default router;
