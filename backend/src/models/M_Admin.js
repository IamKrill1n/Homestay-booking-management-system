import * as homestayRepo from "../repositories/homestayRepository.js";

/**
 * M_Admin — platform administrator (UC 4.1 on the class diagram).
 * Admin: review the pending-homestay queue and approve / reject with a reason.
 * Approved listings become visible on the dashboard; rejected ones stay hidden.
 */
export class M_Admin {
  async viewPendingHomestays() {
    return homestayRepo.findPendingHomestays();
  }

  async viewAllHomestays() {
    return homestayRepo.findAllHomestaysForAdmin();
  }

  async approveHomestay(homestayID) {
    const homestay = await homestayRepo.setHomestayStatus(
      homestayID,
      "approved",
      true,
      null
    );
    if (!homestay) {
      return { valid: false, message: "Homestay not found" };
    }
    return {
      valid: true,
      homestay,
      message: "You have approved a homestay.",
    };
  }

  async rejectHomestay(homestayID, reason) {
    if (!reason || String(reason).trim() === "") {
      return { valid: false, message: "A rejection reason is required" };
    }

    const homestay = await homestayRepo.setHomestayStatus(
      homestayID,
      "rejected",
      false,
      String(reason).trim()
    );
    if (!homestay) {
      return { valid: false, message: "Homestay not found" };
    }
    return {
      valid: true,
      homestay,
      message: `You have rejected a homestay. Reason: ${homestay.rejectionReason}`,
    };
  }
}
