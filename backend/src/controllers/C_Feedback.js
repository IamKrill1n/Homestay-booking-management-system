import { M_Feedback } from "../models/M_Feedback.js";

class C_Feedback {
  async listByHomestay(req, res) {
    try {
      const feedback = await M_Feedback.listForHomestay(req.params.id);
      res.json(feedback);
    } catch (error) {
      console.error("Controller Exception in listByHomestay:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch feedback.",
      });
    }
  }

  async createFeedback(req, res) {
    try {
      const fieldList = {
        bookingID: req.body.bookingID ?? req.body.bookingId,
        guestID: req.body.guestID ?? req.body.guestId,
        rating: Number(req.body.rating),
        feedbackMessage: req.body.feedbackMessage ?? req.body.message,
      };

      const validation = M_Feedback.validate(fieldList);
      if (!validation.valid) {
        return res.status(400).json({
          status: "error",
          message: validation.message,
        });
      }

      const feedback = new M_Feedback(fieldList);
      const result = await feedback.addFeedback();

      if (!result.valid) {
        return res.status(result.statusCode || 400).json({
          status: "error",
          message: result.message,
        });
      }

      return res.status(201).json({
        status: "success",
        message: result.message,
        feedback: result.feedback,
      });
    } catch (error) {
      console.error("Controller Exception in createFeedback:", error);
      return res.status(500).json({
        status: "error",
        message: "An internal server error occurred while submitting feedback.",
      });
    }
  }
}

export default new C_Feedback();
