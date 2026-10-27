import { MockAccount } from '../types/auth';

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    user: {
      id: 'usr-patient-1',
      name: 'Alex Morgan',
      email: 'patient@example.com',
      role: 'patient',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '(555) 234-5678',
    },
    password: 'patient123',
    badgeLabel: 'Verified Patient',
    badgeColor: '#0284C7',
    description: 'Books clinic & telehealth consultations, tracks prescriptions & medical history.',
  },
  {
    user: {
      id: 'usr-doctor-1',
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@careslot.com',
      role: 'doctor',
      doctorId: 'p-1',
      specialty: 'Primary Care',
      licenseNumber: 'MD-CA-94821',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      phone: '(555) 345-6789',
    },
    password: 'doctor123',
    badgeLabel: 'Attending Physician',
    badgeColor: '#16A34A',
    description: 'Manages incoming patient queue, launches HD telehealth sessions & files clinical notes.',
  },
  {
    user: {
      id: 'usr-admin-1',
      name: 'Elena Rostova',
      email: 'admin@careslot.com',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      phone: '(555) 999-0001',
    },
    password: 'admin123',
    badgeLabel: 'System Administrator',
    badgeColor: '#7C3AED',
    description: 'Full administrative access: analytics, doctor approvals, system maintenance & audit logs.',
  },
];
