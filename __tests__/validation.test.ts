import { bookingFormSchema } from '../src/utils/validation';

describe('Booking Form Zod Validation Schema', () => {
  const validData = {
    patientName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '555-123-4567',
    reason: 'Annual medical wellness checkup',
    insuranceProvider: 'Blue Cross Blue Shield',
    visitType: 'telehealth' as const,
    notes: 'No specific accommodations required',
    agreeToTerms: true,
  };

  it('validates a complete, valid form payload successfully', () => {
    const result = bookingFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails if patientName is shorter than 2 characters', () => {
    const result = bookingFormSchema.safeParse({
      ...validData,
      patientName: 'A',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 2 characters/i);
    }
  });

  it('fails on malformed email address', () => {
    const result = bookingFormSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/valid email/i);
    }
  });

  it('fails on invalid phone number format', () => {
    const result = bookingFormSchema.safeParse({
      ...validData,
      phone: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/valid phone number/i);
    }
  });

  it('fails when visit reason is too short', () => {
    const result = bookingFormSchema.safeParse({
      ...validData,
      reason: 'Hi',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 4 characters/i);
    }
  });

  it('fails when agreeToTerms is false', () => {
    const result = bookingFormSchema.safeParse({
      ...validData,
      agreeToTerms: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/confirm the appointment terms/i);
    }
  });

  it('succeeds without optional notes provided', () => {
    const { notes, ...dataWithoutNotes } = validData;
    const result = bookingFormSchema.safeParse(dataWithoutNotes);
    expect(result.success).toBe(true);
  });

  it('validates telehealth and in-person visit types correctly', () => {
    const telehealthResult = bookingFormSchema.safeParse({
      ...validData,
      visitType: 'telehealth',
    });
    expect(telehealthResult.success).toBe(true);

    const inPersonResult = bookingFormSchema.safeParse({
      ...validData,
      visitType: 'in-person',
    });
    expect(inPersonResult.success).toBe(true);

    const invalidResult = bookingFormSchema.safeParse({
      ...validData,
      visitType: 'carrier-pigeon' as any,
    });
    expect(invalidResult.success).toBe(false);
  });
});

