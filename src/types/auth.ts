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
  clinicName?: string;
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

export interface PatientSignupPayload {
  role: 'patient';
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface DoctorSignupPayload {
  role: 'doctor';
  name: string;
  email: string;
  password: string;
  phone: string;
  specialty: string;
  clinicName: string;
  licenseNumber: string;
  consultationFee: number;
  bio?: string;
}

export type SignupPayload = PatientSignupPayload | DoctorSignupPayload;

export interface MockAccount {
  user: AuthUser;
  password: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
}


