import * as homestayRepo from "../repositories/homestayRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import * as bookingRepo from "../repositories/bookingRepository.js";
import * as feedbackRepo from "../repositories/feedbackRepository.js";


const REGISTER_REQUIRED_FIELDS = [
  "email",
  "password",
  "firstName",
  "lastName",
];

const ALLOWED_ROLES = [ "common", "owner", "admin" ]

/**
 * Phần 1 — M_User (lớp cũ trên class diagram).
 * Guest: xem/lọc/tìm homestay, xem bản đồ, kiểm tra dữ liệu đăng ký.
 */
export class M_User {
  constructor({ userID = null, password, firstName, lastName, email, phoneNumber, role = "common" } = {}) {
    this.userID = userID;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.role = role;
  }

  register(fieldList) {
    if (!fieldList || typeof fieldList !== "object") {
      return { valid: false, message: "fieldList is required" };
    }

    for (const field of REGISTER_REQUIRED_FIELDS) {
      const value = fieldList[field];
      if (value == null || String(value).trim() === "") {
        return { valid: false, message: `Missing required field: ${field}` };
      }
    }

    const email = String(fieldList.email);
    if (!email.includes("@")) {
      return { valid: false, message: "Invalid email format" };
    }

    return {
      valid: true,
      message: "Registration data is valid (account creation is Part 2)",
    };
  }

  async viewHomestays() {
    return homestayRepo.findAllHomestays();
  }

  async viewHomestayDetails(homestayID) {
    return homestayRepo.findHomestayById(homestayID);
  }

  viewMap(homestay) {
    if (!homestay) return null;
    return homestay.location ?? null;
  }

  async filterHomestays(options = {}) {
    return homestayRepo.filterHomestays(options);
  }

  async searchHomestays(property) {
    if (!property || String(property).trim() === "") {
      return [];
    }
    return homestayRepo.searchHomestays(String(property).trim());
  }

  //  Part 2: Account, booking, review
  // Account
  async logIn( {email, password} ) {
    const user = await userRepo.findUserByEmail(email);
    
    if (!user || user.password !== password) 
      return null;

    return user;
  }

  async logOut() {
    return new M_User();
  }

  async viewProfile() {
    //TODO
    return this;
  }

  editProfile(info) {
    if (!info) return this;
    for (const field in info)
      this[field] = info[field] ? info[field] : this[field];
  }

  async bookHomestay({ homestay, startDate, endDate, options = {} }) {
    // TODO
  }

  async getBookHistory() {
    return bookingRepo.findBookingByGuestId(this.userID);
  }

  // Review
  async addFeedback({ homestayID, feedbackMessage }) {
    feedbackRepo.addFeedback(this.userID, homestayID, feedbackMessage);
  }

  async removeFeedback(feedbackID) {
    feedbackRepo.removeFeedback(feedbackID);
  }
  
}
