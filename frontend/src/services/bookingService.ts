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
  guest?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
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
  guest?: BookingRow['guest'];
  hasFeedback?: boolean;
}

interface BookingResponse {
  status: string;
  message: string;
  booking: ApiBooking;
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
    guest: apiBooking.guest ?? null,
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

  async listForOwner(ownerId: string | number) {
    const data = await apiRequest<ApiBooking[]>(`/bookings/owner/${ownerId}`);
    return data.map(toBooking);
  },

  async approve(bookingId: string, ownerId: string | number) {
    const data = await apiRequest<BookingResponse>(`/bookings/${bookingId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ ownerID: ownerId }),
    });
    return {
      message: data.message,
      booking: toBooking(data.booking),
    };
  },

  async reject(bookingId: string, ownerId: string | number) {
    const data = await apiRequest<BookingResponse>(`/bookings/${bookingId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ ownerID: ownerId }),
    });
    return {
      message: data.message,
      booking: toBooking(data.booking),
    };
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
