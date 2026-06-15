import * as bookingRepo from "../repositories/bookingRepository.js";

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export class M_Booking {
  constructor({
    bookingID = null,
    homestayID,
    guestID,
    checkInDate,
    checkOutDate,
    totalPrice = null,
    status = "pending",
    createdAt = null,
  } = {}) {
    this.bookingID = bookingID;
    this.homestayID = homestayID;
    this.guestID = guestID;
    this.checkInDate = checkInDate;
    this.checkOutDate = checkOutDate;
    this.totalPrice = totalPrice;
    this.status = status;
    this.createdAt = createdAt;
  }

  static validateBooking(fieldList) {
    if (!fieldList || typeof fieldList !== "object") {
      return { valid: false, message: "Booking payload is required." };
    }

    for (const field of ["homestayID", "guestID", "checkInDate", "checkOutDate"]) {
      if (fieldList[field] == null || String(fieldList[field]).trim() === "") {
        return { valid: false, message: `Missing required field: ${field}` };
      }
    }

    const checkIn = new Date(fieldList.checkInDate);
    const checkOut = new Date(fieldList.checkOutDate);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return { valid: false, message: "Check-in and check-out must be valid dates." };
    }
    if (checkOut <= checkIn) {
      return { valid: false, message: "Check-out must be after check-in." };
    }

    if (
      fieldList.status != null &&
      !ALLOWED_STATUSES.includes(String(fieldList.status).toLowerCase())
    ) {
      return { valid: false, message: "Invalid booking status." };
    }

    return { valid: true };
  }

  calculateTotalHours() {
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    return Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 3_600_000));
  }

  async bookHomestay() {
    return bookingRepo.createBooking(this);
  }

  async getBookHistory(userID) {
    return bookingRepo.findBookingByGuestId(userID);
  }

  async cancelBooking(bookingID) {
    return bookingRepo.cancelBookingById(bookingID);
  }

  toJSON() {
    return {
      bookingID: this.bookingID,
      homestayID: this.homestayID,
      guestID: this.guestID,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      totalPrice: this.totalPrice,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}

export default M_Booking;
