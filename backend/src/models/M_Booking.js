import * as bookingRepo from "../repositories/bookingRepository.js";

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled", "completed", "refunded"];

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

  // 2. NEW: Daily Math (86_400_000 ms = 24 hours)
  calculateTotalNights() {
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    return Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
  }

  // 3. NEW: Master Price Calculator
  calculateAndSetTotalPrice(rate, rentalType) {
    if (rentalType === 'hourly') {
      this.totalPrice = this.calculateTotalHours() * Number(rate);
    } else if (rentalType === 'daily') {
      this.totalPrice = this.calculateTotalNights() * Number(rate);
    }
      return this.totalPrice;
    }
  
  calculateRefund(policy) {
    const now = new Date();
    const checkIn = new Date(this.checkInDate);
      
    // Calculate exact hours remaining until check-in
    const msDifference = checkIn.getTime() - now.getTime();
    const hoursRemaining = msDifference / (1000 * 60 * 60);
  
    // If they are cancelling AFTER check-in time, $0 refund
    if (hoursRemaining <= 0) {
      return { refundAmount: 0, refundPercentage: 0 };
    }
  
    let refundPercentage = 0;
  
    // The Tiered Math
    switch (String(policy).toLowerCase()) {
      case 'flexible':
        if (hoursRemaining >= 24) refundPercentage = 1.0; // 100%
        else refundPercentage = 50;                        
        break;
  
      case 'moderate':
        if (hoursRemaining >= 72) refundPercentage = 1.0;      // 100%
        else if (hoursRemaining >= 24) refundPercentage = 0.75;  
        else refundPercentage = 25;                              
        break;
  
      case 'strict':
        if (hoursRemaining >= 120) refundPercentage = 0.5; 
        else refundPercentage = 0;                         
        break;
  
      default:
        refundPercentage = 0; // Failsafe
    }
  
    return {
      refundPercentage,
      // Math.round ensures we don't get weird decimal fractions in VND
      refundAmount: Math.round(Number(this.totalPrice) * refundPercentage) 
    };
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
