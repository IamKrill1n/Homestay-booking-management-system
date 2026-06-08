export type UserRole = 'guest' | 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Homestay {
  id: string;
  title: string;
  address: string;
  city: string;
  pricePerHour: number;
  maxGuests: number;
  amenities: string[];
  description: string;
  images: string[];
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  availability: 'available' | 'unavailable';
  createdAt: string;
}

export interface Booking {
  id: string;
  homestayId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'user',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    role: 'owner',
  },
  {
    id: '3',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '+1234567892',
    role: 'admin',
  },
];

export const mockHomestays: Homestay[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    address: '123 Main Street, Apt 4B',
    city: 'New York',
    pricePerHour: 25,
    maxGuests: 4,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking'],
    description: 'Beautiful modern apartment in the heart of downtown. Perfect for business meetings or small gatherings.',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    ownerId: '2',
    status: 'approved',
    availability: 'available',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Cozy Suburban Home',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    pricePerHour: 30,
    maxGuests: 6,
    amenities: ['WiFi', 'Kitchen', 'Parking'],
    description: 'Spacious suburban home with a beautiful garden. Ideal for family gatherings and events.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    ownerId: '2',
    status: 'approved',
    availability: 'available',
    createdAt: '2026-01-02T10:00:00Z',
  },
  {
    id: '3',
    title: 'Luxury Penthouse Suite',
    address: '789 High Rise Tower',
    city: 'Chicago',
    pricePerHour: 50,
    maxGuests: 8,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV', 'Parking', 'Bath Tub'],
    description: 'Luxurious penthouse with stunning city views. Perfect for corporate events and special occasions.',
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
    ownerId: '2',
    status: 'approved',
    availability: 'available',
    createdAt: '2026-01-03T10:00:00Z',
  },
  {
    id: '4',
    title: 'Beach House Retreat',
    address: '321 Ocean Drive',
    city: 'Miami',
    pricePerHour: 40,
    maxGuests: 10,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Bath Tub', 'Pets'],
    description: 'Amazing beach house with direct ocean access. Perfect for summer parties and relaxation.',
    images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    ownerId: '2',
    status: 'pending',
    availability: 'available',
    createdAt: '2026-01-04T10:00:00Z',
  },
  {
    id: '5',
    title: 'Mountain Cabin Escape',
    address: '555 Pine Forest Road',
    city: 'Denver',
    pricePerHour: 35,
    maxGuests: 6,
    amenities: ['WiFi', 'Kitchen', 'Parking'],
    description: 'Rustic cabin nestled in the mountains. Great for retreats and nature lovers.',
    images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800'],
    ownerId: '2',
    status: 'approved',
    availability: 'unavailable',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: '6',
    title: 'Urban Loft Studio',
    address: '888 Art District',
    city: 'San Francisco',
    pricePerHour: 28,
    maxGuests: 4,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning'],
    description: 'Bright and airy loft in the arts district. Perfect for creative workshops and photoshoots.',
    images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    ownerId: '2',
    status: 'approved',
    availability: 'available',
    createdAt: '2026-01-06T10:00:00Z',
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    homestayId: '1',
    userId: '1',
    checkIn: '2026-02-01T10:00:00Z',
    checkOut: '2026-02-01T16:00:00Z',
    totalPrice: 150,
    status: 'pending',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    homestayId: '2',
    userId: '1',
    checkIn: '2026-02-05T14:00:00Z',
    checkOut: '2026-02-05T20:00:00Z',
    totalPrice: 180,
    status: 'approved',
    createdAt: '2026-01-16T10:00:00Z',
  },
];
