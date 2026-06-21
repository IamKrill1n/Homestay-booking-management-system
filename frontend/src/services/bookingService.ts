import { apiRequest } from './api';

export interface BookingRow {
  id: string;
  homestayId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  homestay?: {
    title: string;
    address: string;
    city: string;
  } | null;
  hasFeedback: boolean;
}

interface ApiBooking {
  bookingID: number | string;
  homestayID: number | string;
  guestID: number | string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number | string | null;
  status: string;
  createdAt?: string;
  homestay?: BookingRow['homestay'];
  hasFeedback?: boolean;
}

interface BookingResponse {
  status: string;
  message: string;
  booking: ApiBooking;
}

interface BookedRange {
  check_in_date: string;
  check_out_date: string;
}

function toBooking(apiBooking: ApiBooking): BookingRow {
  return {
    id: String(apiBooking.bookingID),
    homestayId: String(apiBooking.homestayID),
    userId: String(apiBooking.guestID),
    checkIn: apiBooking.checkInDate,
    checkOut: apiBooking.checkOutDate,
    totalPrice: Number(apiBooking.totalPrice ?? 0),
    status: String(apiBooking.status).toLowerCase(),
    createdAt: apiBooking.createdAt || new Date().toISOString(),
    homestay: apiBooking.homestay ?? null,
    hasFeedback: Boolean(apiBooking.hasFeedback),
  };
}

export const bookingService = {
  async create(payload: {
    homestayID: number;
    guestID: number;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
  }) {
    const data = await apiRequest<BookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      message: data.message,
      booking: toBooking(data.booking),
    };
  },

  async listForUser(userId: string | number) {
    const data = await apiRequest<ApiBooking[]>(`/bookings/user/${userId}`);
    return data.map(toBooking);
  },

  async getUnavailableDates(homestayId: string | number): Promise<BookedRange[]> {
    const data = await apiRequest<{ status: string, bookedRanges: BookedRange[] }>(
      `/bookings/homestay/${homestayId}/availability`
    );
    return data.bookedRanges || [];
  },

  async cancel(bookingId: string) {
    const data = await apiRequest<BookingResponse>(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
    return {
      message: data.message,
      booking: toBooking(data.booking),
    };
  },
};
