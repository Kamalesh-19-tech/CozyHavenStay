// ============================================
// CozyHaven Stay — Shared TypeScript Types
// ============================================

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  role: 'Guest' | 'HotelOwner' | 'Admin';
  createdAt?: string;
}

export interface Hotel {
  hotelId: number;
  hotelName: string;
  location: string;
  description: string;
  starRating: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasDining: boolean;
  hasPool: boolean;
  hasGym: boolean;
  hasRoomService: boolean;
  isActive: boolean;
  ownerId: number;
  createdAt?: string;
}

export interface Room {
  roomId: number;
  hotelId: number;
  roomSize: string;
  bedType: 'Single' | 'Double' | 'King';
  maxOccupancy: number;
  baseFare: number;
  isAC: boolean;
  isAvailable: boolean;
}

export interface Booking {
  bookingId: number;
  userId: number;
  roomId: number;
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  totalFare: number;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  bookingDate?: string;
  hotelName?: string;
  roomDetails?: string;
}

export interface Review {
  reviewId: number;
  userId: number;
  hotelId: number;
  rating: number;
  comment: string;
  reviewDate?: string;
  userName?: string;
  hotelName?: string;
}

export interface Payment {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Success' | 'Refunded' | 'Pending';
  paymentDate?: string;
}

export interface Refund {
  refundId: number;
  bookingId: number;
  refundAmount: number;
  refundStatus: string;
  refundDate?: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  fullName: string;
  userId: number;
}
