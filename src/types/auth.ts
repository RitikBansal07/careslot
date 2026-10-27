export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  // For doctors
  doctorId?: string;
  specialty?: string;
  licenseNumber?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number; // Unix timestamp ms
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MockAccount {
  user: AuthUser;
  password: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
}

