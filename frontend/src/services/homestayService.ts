import { apiRequest, buildQuery } from './api';

export type HomestayStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type Availability = 'available' | 'unavailable';

export interface Homestay {
  id: string;
  ownerId: string;
  title: string;
  address: string;
  city: string;
  pricePerHour: number;
  maxGuests: number;
  numberOfBeds: number;
  numberOfBedrooms: number;
  amenities: string[];
  description: string;
  images: string[];
  status: HomestayStatus;
  availability: Availability;
  createdAt: string;
  rejectionReason?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rental_type?: 'hourly' | 'daily';
  check_in_time?: string;
  check_out_time?: string;
}

interface ApiHomestay {
  homestayID: number | string;
  ownerID: number | string;
  title: string;
  description?: string | null;
  pricePerHour: number;
  status: HomestayStatus;
  rejectionReason?: string | null;
  createdAt?: string;
  availability?: Availability;
  location?: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    city?: string | null;
  };
  amenities?: {
    numberOfBeds?: number;
    numberOfBedrooms?: number;
    maxGuests?: number;
    hasWifi?: boolean;
    hasAirConditioning?: boolean;
    hasKitchen?: boolean;
    hasBathtub?: boolean;
    hasTv?: boolean;
    hasParking?: boolean;
    isPetFriendly?: boolean;
  };
  rental_type?: 'hourly' | 'daily';
  check_in_time?: string;
  check_out_time?: string;
}

export interface HomestayFilters {
  q?: string | null;
  city?: string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  maxGuests?: number | string | null;
  amenities?: string[];
  rental_type?: 'hourly' | 'daily' | null;
  [key: string]: unknown;
}

export interface HomestayPayload {
  ownerId: string | number;
  title: string;
  address: string;
  city: string;
  pricePerHour: number;
  maxGuests: number;
  description: string;
  amenities: string[];
  latitude?: number | null;
  longitude?: number | null;
}

interface MutationResponse {
  valid?: boolean;
  success?: boolean;
  message: string;
  homestay?: ApiHomestay;
}

const fallbackImages = [
  [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  ],
  [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  ],
  [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  ],
  [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  ],
];

function imagesForHomestay(id: string) {
  const numericId = Number(id);
  const index = Number.isFinite(numericId) ? Math.abs(numericId - 1) % fallbackImages.length : 0;
  return fallbackImages[index];
}

function amenityNames(amenities: ApiHomestay['amenities']) {
  if (!amenities) return [];

  return [
    amenities.hasWifi ? 'WiFi' : null,
    amenities.hasKitchen ? 'Kitchen' : null,
    amenities.hasAirConditioning ? 'Air Conditioning' : null,
    amenities.hasTv ? 'TV' : null,
    amenities.hasParking ? 'Parking' : null,
    amenities.hasBathtub ? 'Bath Tub' : null,
    amenities.isPetFriendly ? 'Pets' : null,
  ].filter(Boolean) as string[];
}

export function toHomestay(apiHomestay: ApiHomestay): Homestay {
  const id = String(apiHomestay.homestayID);

  return {
    id,
    ownerId: String(apiHomestay.ownerID),
    title: apiHomestay.title,
    address: apiHomestay.location?.address || '',
    city: apiHomestay.location?.city || '',
    pricePerHour: Number(apiHomestay.pricePerHour),
    maxGuests: Number(apiHomestay.amenities?.maxGuests ?? 1),
    numberOfBeds: Number(apiHomestay.amenities?.numberOfBeds ?? 0),
    numberOfBedrooms: Number(apiHomestay.amenities?.numberOfBedrooms ?? 0),
    amenities: amenityNames(apiHomestay.amenities),
    description: apiHomestay.description || '',
    images: imagesForHomestay(id),
    status: apiHomestay.status,
    availability: apiHomestay.availability || (apiHomestay.status === 'approved' ? 'available' : 'unavailable'),
    createdAt: apiHomestay.createdAt || new Date().toISOString(),
    rejectionReason: apiHomestay.rejectionReason,
    latitude: apiHomestay.location?.latitude ?? null,
    longitude: apiHomestay.location?.longitude ?? null,
    
    rental_type: apiHomestay.rental_type,
    check_in_time: apiHomestay.check_in_time,
    check_out_time: apiHomestay.check_out_time,
  };
}

function mapMutationResponse(response: MutationResponse) {
  return {
    message: response.message,
    homestay: response.homestay ? toHomestay(response.homestay) : null,
  };
}

export const homestayService = {
  async list(filters: HomestayFilters = {}) {
    const data = await apiRequest<ApiHomestay[]>(`/homestays${buildQuery(filters)}`);
    return data.map(toHomestay);
  },

  async get(id: string) {
    return toHomestay(await apiRequest<ApiHomestay>(`/homestays/${id}`));
  },

  async listOwner(ownerId: string | number) {
    const data = await apiRequest<ApiHomestay[]>(`/owner/homestays${buildQuery({ ownerId })}`);
    return data.map(toHomestay);
  },

  async getOwner(id: string, ownerId: string | number) {
    return toHomestay(
      await apiRequest<ApiHomestay>(`/owner/homestays/${id}${buildQuery({ ownerId })}`)
    );
  },

  async createOwner(payload: HomestayPayload) {
    const data = await apiRequest<MutationResponse>('/owner/homestays', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapMutationResponse(data);
  },

  async updateOwner(id: string, payload: HomestayPayload) {
    const data = await apiRequest<MutationResponse>(`/owner/homestays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapMutationResponse(data);
  },

  async deleteOwner(id: string) {
    const data = await apiRequest<MutationResponse>(`/owner/homestays/${id}`, {
      method: 'DELETE',
    });
    return mapMutationResponse(data);
  },

  async listAdmin() {
    const data = await apiRequest<ApiHomestay[]>('/admin/homestays');
    return data.map(toHomestay);
  },

  async listPendingAdmin() {
    const data = await apiRequest<ApiHomestay[]>('/admin/homestays/pending');
    return data.map(toHomestay);
  },

  async approveAdmin(id: string) {
    const data = await apiRequest<MutationResponse>(`/admin/homestays/${id}/approve`, {
      method: 'POST',
    });
    return mapMutationResponse(data);
  },

  async rejectAdmin(id: string, reason: string) {
    const data = await apiRequest<MutationResponse>(`/admin/homestays/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return mapMutationResponse(data);
  },
};
