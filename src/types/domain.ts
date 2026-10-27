export type Specialty =
  | 'All'
  | 'Primary Care'
  | 'Cardiology'
  | 'Dermatology'
  | 'Pediatrics'
  | 'Neurology'
  | 'Orthopedics'
  | 'Psychiatry'
  | 'Ophthalmology'
  | 'Dentistry';

export type VisitType = 'in-person' | 'telehealth';

export interface TimeSlot {
  id: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "09:00 AM"
  endTime: string; // e.g., "09:30 AM"
  period: 'morning' | 'afternoon';
  isAvailable: boolean;
}

export interface Provider {
  id: string;
  name: string;
  title: string; // e.g., "MD, FACP"
  specialty: Specialty;
  rating: number; // e.g., 4.9
  reviewCount: number;
  experienceYears: number;
  bio: string;
  location: {
    clinicName: string;
    address: string;
    city: string;
    state: string;
    distanceMiles: number;
  };
  consultationFee: number;
  avatarUrl: string;
  languages: string[];
  acceptedInsurances: string[];
  nextAvailableDate: string; // YYYY-MM-DD
  availableSlotsCount: number;
}

export interface BookingRequest {
  providerId: string;
  slotId: string;
  patientName: string;
  email: string;
  phone: string;
  reason: string;
  insuranceProvider: string;
  visitType?: VisitType;
  notes?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  provider: Provider;
  slot: TimeSlot;
  patientName: string;
  email: string;
  phone: string;
  reason: string;
  insuranceProvider: string;
  visitType: VisitType;
  telehealthChannelId?: string;
  telehealthToken?: string;
  telehealthDoctorStatus?: 'waiting' | 'in-room' | 'completed';
  consultationNotes?: string;
  prescriptions?: string[];
  notes?: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
}

export interface ProviderFilterParams {
  specialty?: string;
  search?: string;
  onlyFavorites?: boolean;
}
