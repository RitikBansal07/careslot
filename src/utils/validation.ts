import { z } from 'zod';

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

export const bookingFormSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be under 80 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number (e.g. 555-123-4567)'),
  reason: z
    .string()
    .trim()
    .min(4, 'Reason must be at least 4 characters')
    .max(300, 'Reason cannot exceed 300 characters'),
  insuranceProvider: z
    .string()
    .min(1, 'Please select or enter an insurance option'),
  visitType: z.enum(['in-person', 'telehealth']),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must confirm the appointment terms to continue',
    }),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const COMMON_VISIT_REASONS = [
  'Annual Health Checkup',
  'General Consultation',
  'Follow-up Visit',
  'Prescription Refill',
  'Lab Test Discussion',
  'Preventive Screening',
];

export const INSURANCE_PROVIDERS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealthcare',
  'Medicare',
  'Humana',
  'Self-Pay (No Insurance)',
];

