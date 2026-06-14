import * as homestayRepo from "../repositories/homestayRepository.js";
import * as userRepo from "../repositories/userRepository.js";

const REGISTER_REQUIRED_FIELDS = [
  "email",
  "password",
  "phoneNumber",
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

  static validateRegistration(fieldList) {
    if (!fieldList || typeof fieldList !== "object") {
      return { valid: false, message: "Registration configuration payload is required." };
    }

    for (const field of REGISTER_REQUIRED_FIELDS) {
      const value = fieldList[field];
      if (value == null || String(value).trim() === "") {
        return { valid: false, message: `Missing required field: ${field}` };
      }
    }

    const email = String(fieldList.email);
    if (!email.includes("@")) {
      return { valid: false, message: "Invalid email format." };
    }

    return { valid: true };
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
    return (user && user.password === password) ? user : null;
  }

  async logOut() {
    return new M_User();
  }

  async viewProfile() {
    return { ...this }
  }

  editProfile(info) {
    if (!info || typeof info !== "object") return;
    
    for (const field in info) {
      if (field !== "userID" && field !== "role" && this.hasOwnProperty(field)) {
        if (info[field] !== undefined && String(info[field]).trim() !== "")
          this[field] = info[field];
      }
    }
  }

  // Utils
  toSafeJSON() {
    return {
      userID: this.userID,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      role: this.role
    };
  }
  
}