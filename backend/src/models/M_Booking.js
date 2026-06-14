import * as bookingRepo from "../repositories/bookingRepository.js";

export default class M_Booking {
  // TODO: add constructor
  
  // Booking
  async bookHomestay({ homestay, startDate, endDate, options = {} }) {
    // TODO
  }

  async getBookHistory(userID) {
    return bookingRepo.findBookingByGuestId(userID);
  }
}