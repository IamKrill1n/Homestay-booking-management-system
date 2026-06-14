import * as feedbackRepo from "../repositories/feedbackRepository.js";

export default class M_Feedback {
  // TODO: add constructor
  
  // Feedback
  async addFeedback({ userID, homestayID, feedbackMessage }) {
    feedbackRepo.addFeedback(userID, homestayID, feedbackMessage);
  }

  async removeFeedback(feedbackID) {
    feedbackRepo.removeFeedback(feedbackID);
  }
}