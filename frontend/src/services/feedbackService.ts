import { apiRequest } from './api';

export interface Feedback {
  feedbackID: number | string;
  bookingID: number | string;
  homestayID: number | string;
  guestID: number | string;
  guestName: string;
  rating: number;
  feedbackDate: string;
  feedbackMessage: string;
}

interface FeedbackResponse {
  status: string;
  message: string;
  feedback: Feedback;
}

export const feedbackService = {
  async listForHomestay(homestayId: string) {
    return apiRequest<Feedback[]>(`/homestays/${homestayId}/feedback`);
  },

  async submit(payload: {
    bookingID: string;
    guestID: string | number;
    rating: number;
    feedbackMessage: string;
  }) {
    const data = await apiRequest<FeedbackResponse>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },
};
