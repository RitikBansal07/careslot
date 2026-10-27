import { mockApi } from '../src/api/mockApi';
import { telehealthService } from '../src/services/telehealthService';
import { getRelativeDateString } from '../src/utils/dateHelpers';
import { useFavoritesStore } from '../src/store/useFavoritesStore';

describe('Telehealth Video Consultation Architecture (v2.0.0)', () => {
  beforeEach(() => {
    mockApi.resetData();
    useFavoritesStore.setState({ bookings: [], favoriteIds: [] });
  });

  it('provisions a secure telehealth channel and clinical notes on booking', async () => {
    const todayStr = getRelativeDateString(0);
    const slots = await mockApi.getSlotsByProvider('p-1', todayStr);
    const availableSlot = slots.find((s) => s.isAvailable)!;

    const confirmation = await mockApi.bookSlot({
      providerId: 'p-1',
      slotId: availableSlot.id,
      patientName: 'Alex Telehealth',
      email: 'alex@example.com',
      phone: '555-456-7890',
      reason: 'Telehealth follow-up on allergy therapy',
      insuranceProvider: 'UnitedHealthcare',
      visitType: 'telehealth',
      notes: 'Please review lab report attached to profile',
    });

    expect(confirmation.visitType).toBe('telehealth');
    expect(confirmation.telehealthChannelId).toBeDefined();
    expect(confirmation.telehealthChannelId).toContain('careslot-');
    expect(confirmation.telehealthDoctorStatus).toBe('waiting');
    expect(confirmation.consultationNotes).toBeDefined();
    expect(confirmation.prescriptions).toBeDefined();
    expect(confirmation.prescriptions?.length).toBeGreaterThan(0);
  });

  it('runs pre-call hardware diagnostics successfully', async () => {
    const diag = await telehealthService.runPreCallDiagnostics();
    expect(diag.cameraSupported).toBe(true);
    expect(diag.microphoneSupported).toBe(true);
  });

  it('correctly toggles microphone and camera state', () => {
    expect(telehealthService.isMicMuted()).toBe(false);
    expect(telehealthService.isCamDisabled()).toBe(false);

    telehealthService.toggleMicrophone(true);
    expect(telehealthService.isMicMuted()).toBe(true);

    telehealthService.toggleMicrophone(false);
    expect(telehealthService.isMicMuted()).toBe(false);

    telehealthService.toggleCamera(true);
    expect(telehealthService.isCamDisabled()).toBe(true);

    telehealthService.toggleCamera(false);
    expect(telehealthService.isCamDisabled()).toBe(false);
  });

  it('persists telehealth appointments and allows cancellation', async () => {
    const todayStr = getRelativeDateString(0);
    const slots = await mockApi.getSlotsByProvider('p-1', todayStr);
    const slot = slots.find((s) => s.isAvailable)!;

    const confirmation = await mockApi.bookSlot({
      providerId: 'p-1',
      slotId: slot.id,
      patientName: 'Taylor Patient',
      email: 'taylor@example.com',
      phone: '555-000-1111',
      reason: 'Routine virtual consultation',
      insuranceProvider: 'Aetna',
      visitType: 'telehealth',
    });

    useFavoritesStore.getState().addBooking(confirmation);
    expect(useFavoritesStore.getState().bookings.length).toBe(1);

    useFavoritesStore.getState().cancelBooking(confirmation.bookingId);
    expect(useFavoritesStore.getState().bookings[0].status).toBe('cancelled');
  });
});
