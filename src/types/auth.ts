export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  createdAt?: string;
  technicianProfile?: {
    id: string;
    location: string;
    hourlyRate: number | string;
    skills: string[];
    bio?: string | null;
    experienceYears?: number;
    avgRating?: number;
    reviewCount?: number;
  } | null;
}

export interface AuthSessionResponse {
  success: boolean;
  message: string;
  user: SafeUser | null;
}
