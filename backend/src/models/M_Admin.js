let homestayRepoPromise;

function loadHomestayRepository() {
  homestayRepoPromise ??= import("../repositories/homestayRepository.js");
  return homestayRepoPromise;
}

/**
 * M_Admin — platform administrator (UC 4.1 on the class diagram).
 * Admin: review the pending-homestay queue and approve / reject with a reason.
 * Approved listings become visible on the dashboard; rejected ones stay hidden.
 */
export class M_Admin {
  constructor(repository = null) {
    this.homestayRepo = repository;
  }

  async getHomestayRepository() {
    return this.homestayRepo ?? loadHomestayRepository();
  }

  async viewPendingHomestays() {
    const homestayRepo = await this.getHomestayRepository();
    return homestayRepo.findPendingHomestays();
  }

  async viewAllHomestays() {
    const homestayRepo = await this.getHomestayRepository();
    return homestayRepo.findAllHomestaysForAdmin();
  }

  async approveHomestay(homestayID) {
    const homestayRepo = await this.getHomestayRepository();
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

    const homestayRepo = await this.getHomestayRepository();
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
