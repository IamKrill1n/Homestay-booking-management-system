import * as feedbackRepo from "../repositories/feedbackRepository.js";

export class M_Feedback {
  constructor({
    feedbackID = null,
    bookingID,
    homestayID = null,
    guestID,
    rating,
    feedbackDate = null,
    feedbackMessage,
  } = {}) {
    this.feedbackID = feedbackID;
    this.bookingID = bookingID;
    this.homestayID = homestayID;
    this.guestID = guestID;
    this.rating = rating;
    this.feedbackDate = feedbackDate;
    this.feedbackMessage = feedbackMessage;
  }

  static validate(fieldList) {
    if (!fieldList || typeof fieldList !== "object") {
      return { valid: false, message: "Feedback payload is required." };
    }

    for (const field of ["bookingID", "guestID", "rating", "feedbackMessage"]) {
      if (fieldList[field] == null || String(fieldList[field]).trim() === "") {
        return { valid: false, message: `Missing required field: ${field}` };
      }
    }

    const rating = Number(fieldList.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { valid: false, message: "rating must be an integer between 1 and 5." };
    }

    return { valid: true };
  }

  static async listForHomestay(homestayID) {
    return feedbackRepo.findFeedbackByHomestayId(homestayID);
  }

  async addFeedback() {
    return feedbackRepo.addFeedback({
      bookingID: this.bookingID,
      guestID: this.guestID,
      rating: this.rating,
      feedbackMessage: this.feedbackMessage,
    });
  }

  async removeFeedback() {
    return feedbackRepo.removeFeedback(this.feedbackID, this.guestID);
  }
}

export default M_Feedback;
