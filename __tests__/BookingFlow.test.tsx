import { mockApi } from '../src/api/mockApi';
import { useDebugStore } from '../src/store/useDebugStore';
import { getRelativeDateString } from '../src/utils/dateHelpers';

describe('Booking Flow Integration & Error Handling', () => {
  beforeEach(() => {
    // Reset debug settings and mock data before each test
    useDebugStore.getState().resetDefaults();
    mockApi.resetData();
  });

  it('successfully books an available slot and marks it as unavailable', async () => {
    const todayStr = getRelativeDateString(0);
    const slots = await mockApi.getSlotsByProvider('p-1', todayStr);
    const availableSlot = slots.find((s) => s.isAvailable);

    expect(availableSlot).toBeDefined();

    const bookingRequest = {
      providerId: 'p-1',
      slotId: availableSlot!.id,
      patientName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '555-987-6543',
      reason: 'Routine annual checkup',
      insuranceProvider: 'Aetna',
    };

    const confirmation = await mockApi.bookSlot(bookingRequest);

    expect(confirmation).toBeDefined();
    expect(confirmation.bookingId).toMatch(/^CS-\d+/);
    expect(confirmation.patientName).toBe('Jane Doe');
    expect(confirmation.status).toBe('confirmed');
    expect(confirmation.provider.id).toBe('p-1');

    // Slot should now be marked unavailable
    const updatedSlots = await mockApi.getSlotsByProvider('p-1', todayStr);
    const recheckedSlot = updatedSlots.find((s) => s.id === availableSlot!.id);
    expect(recheckedSlot?.isAvailable).toBe(false);
  });

  it('rejects double-booking when the slot is already booked', async () => {
    const todayStr = getRelativeDateString(0);
    const slots = await mockApi.getSlotsByProvider('p-1', todayStr);
    const availableSlot = slots.find((s) => s.isAvailable);

    const bookingRequest = {
      providerId: 'p-1',
      slotId: availableSlot!.id,
      patientName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '555-987-6543',
      reason: 'Routine checkup',
      insuranceProvider: 'Cigna',
    };

    // First booking succeeds
    await mockApi.bookSlot(bookingRequest);

    // Second booking of same slot must throw
    await expect(mockApi.bookSlot(bookingRequest)).rejects.toThrow(
      /This time slot was just booked by another patient/i
    );
  });

  it('handles simulated network failure when failure rate is 100%', async () => {
    useDebugStore.getState().setFailureRate(1.0);

    await expect(mockApi.getProviders()).rejects.toThrow(
      /Simulated network disruption/i
    );
  });

  it('returns empty array when forceEmptyState is enabled', async () => {
    useDebugStore.getState().setForceEmptyState(true);

    const providers = await mockApi.getProviders();
    expect(providers).toEqual([]);
  });
});

