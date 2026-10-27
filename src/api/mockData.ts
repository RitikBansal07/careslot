import { Provider, TimeSlot, Specialty } from '../types/domain';
import { getRelativeDateString, getNextSevenDays } from '../utils/dateHelpers';

export const SPECIALTIES: Specialty[] = [
  'All',
  'Primary Care',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'Psychiatry',
  'Ophthalmology',
  'Dentistry',
];

export const INITIAL_PROVIDERS_RAW: Omit<Provider, 'nextAvailableDate' | 'availableSlotsCount'>[] = [
  {
    id: 'p-1',
    name: 'Dr. Sarah Jenkins',
    title: 'MD, FACP',
    specialty: 'Primary Care',
    rating: 4.95,
    reviewCount: 312,
    experienceYears: 14,
    bio: 'Board-certified internist focusing on preventive healthcare, chronic disease management, and comprehensive adult medicine.',
    location: {
      clinicName: 'Metropolitan Health Center',
      address: '450 Lexington Ave, Suite 600',
      city: 'New York',
      state: 'NY',
      distanceMiles: 0.8,
    },
    consultationFee: 120,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Spanish'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna'],
  },
  {
    id: 'p-2',
    name: 'Dr. Marcus Vance',
    title: 'MD, FACC',
    specialty: 'Cardiology',
    rating: 4.91,
    reviewCount: 245,
    experienceYears: 18,
    bio: 'Non-invasive cardiovascular specialist with extensive experience in preventive cardiology, hypertension, and echocardiography.',
    location: {
      clinicName: 'East River Heart Institute',
      address: '1120 1st Avenue, Suite 320',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.4,
    },
    consultationFee: 195,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    languages: ['English'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Medicare', 'Aetna'],
  },
  {
    id: 'p-3',
    name: 'Dr. Elena Rostova',
    title: 'MD, FAAD',
    specialty: 'Dermatology',
    rating: 4.88,
    reviewCount: 420,
    experienceYears: 11,
    bio: 'Specialist in medical and cosmetic dermatology, skin cancer screenings, acne treatments, and minimally invasive laser therapies.',
    location: {
      clinicName: 'Midtown Dermatology Associates',
      address: '590 Madison Ave, Floor 14',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.1,
    },
    consultationFee: 160,
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Russian'],
    acceptedInsurances: ['UnitedHealthcare', 'Cigna', 'Aetna'],
  },
  {
    id: 'p-4',
    name: 'Dr. David Chen',
    title: 'MD, FAAP',
    specialty: 'Pediatrics',
    rating: 4.97,
    reviewCount: 388,
    experienceYears: 16,
    bio: 'Warm, patient-centered pediatrician passionate about newborn care, developmental milestones, and adolescent wellness.',
    location: {
      clinicName: 'Central Park Pediatric Group',
      address: '77 Central Park West',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.9,
    },
    consultationFee: 135,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Mandarin'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Aetna', 'Humana', 'Medicare'],
  },
  {
    id: 'p-5',
    name: 'Dr. Amara Okafor',
    title: 'MD, PhD',
    specialty: 'Neurology',
    rating: 4.92,
    reviewCount: 198,
    experienceYears: 15,
    bio: 'Neurologist with dual clinical and research focus on migraine management, memory disorders, and peripheral neuropathy.',
    location: {
      clinicName: 'Hudson Neurological Center',
      address: '340 Hudson Street, Suite 500',
      city: 'New York',
      state: 'NY',
      distanceMiles: 2.2,
    },
    consultationFee: 210,
    avatarUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'French', 'Igbo'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'UnitedHealthcare'],
  },
  {
    id: 'p-6',
    name: 'Dr. James Thorne',
    title: 'MD, FAAOS',
    specialty: 'Orthopedics',
    rating: 4.86,
    reviewCount: 275,
    experienceYears: 20,
    bio: 'Orthopedic surgeon and sports medicine specialist dedicated to knee arthroscopy, shoulder repairs, and joint preservation.',
    location: {
      clinicName: 'Empire Orthopedic & Sports Medicine',
      address: '520 8th Avenue, Floor 9',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.7,
    },
    consultationFee: 185,
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    languages: ['English'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
  },
  {
    id: 'p-7',
    name: 'Dr. Sophia Alvarez',
    title: 'MD',
    specialty: 'Psychiatry',
    rating: 4.94,
    reviewCount: 310,
    experienceYears: 12,
    bio: 'Adult psychiatrist specializing in anxiety, mood disorders, ADHD evaluations, and integrated psychotherapy with medication management.',
    location: {
      clinicName: 'Gramercy Behavioral Health',
      address: '140 E 19th Street, Suite 4B',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.5,
    },
    consultationFee: 175,
    avatarUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Spanish'],
    acceptedInsurances: ['Aetna', 'Cigna', 'UnitedHealthcare'],
  },
  {
    id: 'p-8',
    name: 'Dr. Brian Morales',
    title: 'OD, FAAO',
    specialty: 'Ophthalmology',
    rating: 4.89,
    reviewCount: 220,
    experienceYears: 13,
    bio: 'Comprehensive eye care provider specializing in glaucoma detection, diabetic eye exams, dry eye therapy, and laser vision consultations.',
    location: {
      clinicName: 'ClearVision Optical & Eye Care',
      address: '280 Broadway, Ground Suite',
      city: 'New York',
      state: 'NY',
      distanceMiles: 2.0,
    },
    consultationFee: 130,
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Spanish'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Humana', 'Medicare'],
  },
  {
    id: 'p-9',
    name: 'Dr. Maya Patel',
    title: 'DDS',
    specialty: 'Dentistry',
    rating: 4.96,
    reviewCount: 450,
    experienceYears: 9,
    bio: 'Compassionate general and cosmetic dentist emphasizing gentle cleanings, tooth-colored restorations, Invisalign, and patient comfort.',
    location: {
      clinicName: 'Chelsea Modern Dental Care',
      address: '210 West 23rd St, Suite 300',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.3,
    },
    consultationFee: 110,
    avatarUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Hindi', 'Gujarati'],
    acceptedInsurances: ['Aetna', 'Cigna', 'Delta Dental', 'MetLife'],
  },
  {
    id: 'p-10',
    name: 'Dr. Ethan Miller',
    title: 'MD',
    specialty: 'Primary Care',
    rating: 4.85,
    reviewCount: 160,
    experienceYears: 8,
    bio: 'Family physician with holistic approach to acute illnesses, lifestyle medicine, nutrition counseling, and annual checkups.',
    location: {
      clinicName: 'Greenwich Family Medical',
      address: '88 Greenwich Ave',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.8,
    },
    consultationFee: 115,
    avatarUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',
    languages: ['English'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare'],
  },
  {
    id: 'p-11',
    name: 'Dr. Rachel Kim',
    title: 'MD, FACC',
    specialty: 'Cardiology',
    rating: 4.93,
    reviewCount: 280,
    experienceYears: 17,
    bio: 'Clinical cardiologist specializing in women’s cardiovascular health, cardiac rehabilitation, and lipidology.',
    location: {
      clinicName: 'Manhattan Heart & Vascular',
      address: '630 5th Avenue, Suite 1102',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.0,
    },
    consultationFee: 200,
    avatarUrl: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Korean'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Medicare', 'Cigna'],
  },
  {
    id: 'p-12',
    name: 'Dr. Tariq Al-Mansoor',
    title: 'MD, FAAD',
    specialty: 'Dermatology',
    rating: 4.90,
    reviewCount: 340,
    experienceYears: 14,
    bio: 'Dermatologist with special expertise in complex rashes, eczema, psoriasis biologics, and pediatric skin conditions.',
    location: {
      clinicName: 'SoHo Skin & Laser Clinic',
      address: '470 Broome Street, 3rd Floor',
      city: 'New York',
      state: 'NY',
      distanceMiles: 2.1,
    },
    consultationFee: 165,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Arabic'],
    acceptedInsurances: ['Aetna', 'UnitedHealthcare'],
  },
  {
    id: 'p-13',
    name: 'Dr. Chloe Dupuis',
    title: 'MD, FAAP',
    specialty: 'Pediatrics',
    rating: 4.96,
    reviewCount: 390,
    experienceYears: 15,
    bio: 'Community pediatrician dedicated to childhood asthma management, immunizations, and early childhood nutrition.',
    location: {
      clinicName: 'Tribeca Children’s Clinic',
      address: '150 Franklin Street',
      city: 'New York',
      state: 'NY',
      distanceMiles: 2.4,
    },
    consultationFee: 140,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'French'],
    acceptedInsurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare'],
  },
  {
    id: 'p-14',
    name: 'Dr. Samuel Green',
    title: 'MD',
    specialty: 'Orthopedics',
    rating: 4.87,
    reviewCount: 215,
    experienceYears: 19,
    bio: 'Hand and upper extremity specialist dealing with carpal tunnel release, sports fractures, and arthritic relief therapies.',
    location: {
      clinicName: 'Upper East Orthopedic Group',
      address: '840 Park Avenue',
      city: 'New York',
      state: 'NY',
      distanceMiles: 2.5,
    },
    consultationFee: 190,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    languages: ['English'],
    acceptedInsurances: ['Aetna', 'Medicare', 'Cigna'],
  },
  {
    id: 'p-15',
    name: 'Dr. Nina Patel-Shah',
    title: 'MD',
    specialty: 'Psychiatry',
    rating: 4.93,
    reviewCount: 260,
    experienceYears: 11,
    bio: 'Integrative psychiatrist helping adolescents and adults through cognitive behavioral therapy and evidence-based pharmacotherapy.',
    location: {
      clinicName: 'Union Square Mind Health',
      address: '33 Union Square West, Suite 8',
      city: 'New York',
      state: 'NY',
      distanceMiles: 1.2,
    },
    consultationFee: 170,
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Hindi'],
    acceptedInsurances: ['UnitedHealthcare', 'Cigna', 'Blue Cross Blue Shield'],
  },
];

const SLOT_SCHEDULES: { startTime: string; endTime: string; period: 'morning' | 'afternoon' }[] = [
  { startTime: '09:00 AM', endTime: '09:30 AM', period: 'morning' },
  { startTime: '09:45 AM', endTime: '10:15 AM', period: 'morning' },
  { startTime: '10:30 AM', endTime: '11:00 AM', period: 'morning' },
  { startTime: '11:15 AM', endTime: '11:45 AM', period: 'morning' },
  { startTime: '01:30 PM', endTime: '02:00 PM', period: 'afternoon' },
  { startTime: '02:15 PM', endTime: '02:45 PM', period: 'afternoon' },
  { startTime: '03:15 PM', endTime: '03:45 PM', period: 'afternoon' },
  { startTime: '04:00 PM', endTime: '04:30 PM', period: 'afternoon' },
];

/**
 * Dynamically builds 7 days of time slots for all mock providers.
 * Consistent pseudo-random availability ensures both available and booked slots exist.
 */
export function generateInitialSlots(): TimeSlot[] {
  const dates = getNextSevenDays();
  const slots: TimeSlot[] = [];

  INITIAL_PROVIDERS_RAW.forEach((provider, pIdx) => {
    dates.forEach((dateStr, dIdx) => {
      SLOT_SCHEDULES.forEach((sched, sIdx) => {
        // Deterministic availability hash based on provider, date offset, and slot
        const hash = (pIdx * 17 + dIdx * 7 + sIdx * 11) % 10;
        // 70% available, 30% already booked
        const isAvailable = hash < 7;

        slots.push({
          id: `slot-${provider.id}-${dateStr}-${sched.startTime.replace(/[^a-zA-Z0-9]/g, '')}`,
          providerId: provider.id,
          date: dateStr,
          startTime: sched.startTime,
          endTime: sched.endTime,
          period: sched.period,
          isAvailable,
        });
      });
    });
  });

  return slots;
}

/**
 * Builds the full Provider objects with dynamic nextAvailableDate & count calculated from initial slots.
 */
export function generateInitialProviders(slots: TimeSlot[]): Provider[] {
  return INITIAL_PROVIDERS_RAW.map((raw) => {
    const providerSlots = slots.filter((s) => s.providerId === raw.id && s.isAvailable);
    const firstAvailable = providerSlots[0]?.date || getRelativeDateString(0);
    return {
      ...raw,
      nextAvailableDate: firstAvailable,
      availableSlotsCount: providerSlots.length,
    };
  });
}

