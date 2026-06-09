import pool from "../db/pool.js"
import { M_Feedback } from "../models/M_Feedback.js"

function mapRowToFeedback (row) {
  if (!row) return null;

  return new M_Feedback({
    feedbackID      : row.feedback_id, 
    homestayID      : row.homestay_id, 
    guestID         : row.guest_id, 
    feedbackDate    : row.feedback_date,
    feedbackMessage : row.feedback_message
  });
}

export function addFeedback({ homestayID, guestID, feedbackMessage }) {
  const result = await pool.query(
    `INSERT INTO feedbacks (homestay_id, guest_id, feedback_message) VALUES ($1, $2, $3)`,
    [homestayID, guestID, feedbackMessage]
  );
}

export function removeFeedback(feedbackID) {
  const result = await pool.query(
    `DELETE FROM feedbacks WHERE feedback_id = $1`, 
    [feedbackID]
  );
}