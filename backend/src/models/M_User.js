import * as homestayRepo from "../repositories/homestayRepository.js";

const REGISTER_REQUIRED_FIELDS = [
  "email",
  "password",
  "firstName",
  "lastName",
];

/**
 * Phần 1 — M_User (lớp cũ trên class diagram).
 * Guest: xem/lọc/tìm homestay, xem bản đồ, kiểm tra dữ liệu đăng ký.
 */
export class M_User {
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
}
