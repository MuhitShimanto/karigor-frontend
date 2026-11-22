import { SafeUser } from './auth';
import { BookingStatus } from '@/lib/constants';

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  title: string;
  description?: string | null;
  price: number | string;
  technicianId: string;
  categoryId: string;
  category?: Category;
  technician?: TechnicianProfile;
}

export interface AvailabilitySlot {
  id: string;
  technicianId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: {
    id?: string;
    name: string;
  };
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  bio?: string | null;
  skills: string[];
  experienceYears: number;
  location: string;
  hourlyRate: number | string;
  avgRating: number;
  reviewCount: number;
  avatarUrl?: string;
  services?: Service[];
  slots?: AvailabilitySlot[];
  reviews?: Review[];
}

export interface Booking {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  slotId: string;
  address: string;
  notes?: string | null;
  totalAmount: number | string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  customer?: SafeUser;
  technician?: TechnicianProfile;
  service?: Service;
  slot?: AvailabilitySlot;
  payments?: Payment[];
  review?: Review | null;
}

export interface Payment {
  id: string;
  transactionId: string;
  bookingId: string;
  amount: number | string;
  currency: string;
  method?: string | null;
  provider: 'STRIPE' | 'SSLCOMMERZ';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paidAt?: string | null;
  gatewayPayload?: unknown;
  createdAt: string;
  booking?: Booking;
}
