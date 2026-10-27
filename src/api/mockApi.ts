import { ICareSlotApi } from './client';
import {
  Provider,
  TimeSlot,
  BookingRequest,
  BookingConfirmation,
  ProviderFilterParams,
} from '../types/domain';
import {
  generateInitialSlots,
  generateInitialProviders,
} from './mockData';
import { useDebugStore } from '../store/useDebugStore';

class MockCareSlotApi implements ICareSlotApi {
  private slots: TimeSlot[];
  private providers: Provider[];

  constructor() {
    this.slots = generateInitialSlots();
    this.providers = generateInitialProviders(this.slots);
  }

  private async applyChaosAndLatency(): Promise<void> {
    const debug = useDebugStore.getState();

    // Latency simulation
    if (debug.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, debug.latencyMs));
    }

    // Force infinite loading simulation if toggled
    if (debug.forceLoadingState) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }

    // Simulated failure simulation
    if (debug.failureRate > 0) {
      const roll = Math.random();
      if (roll < debug.failureRate) {
        throw new Error('Simulated network disruption: Please retry the request.');
      }
    }
  }

  async getProviders(params?: ProviderFilterParams): Promise<Provider[]> {
    await this.applyChaosAndLatency();

    const debug = useDebugStore.getState();
    if (debug.forceEmptyState) {
      return [];
    }

    let filtered = [...this.providers];

    // Filter by Specialty
    if (params?.specialty && params.specialty !== 'All') {
      filtered = filtered.filter(
        (p) => p.specialty.toLowerCase() === params.specialty!.toLowerCase()
      );
    }

    // Filter by Search Query
    if (params?.search && params.search.trim().length > 0) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.location.clinicName.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  async getProviderDetail(
    id: string
  ): Promise<{ provider: Provider; slots: TimeSlot[] } | null> {
    await this.applyChaosAndLatency();

    const debug = useDebugStore.getState();
    if (debug.forceEmptyState) {
      return null;
    }

    const provider = this.providers.find((p) => p.id === id);
    if (!provider) {
      return null;
    }

    const slots = this.slots.filter((s) => s.providerId === id);
    return { provider, slots };
  }

  async getSlotsByProvider(providerId: string, date?: string): Promise<TimeSlot[]> {
    await this.applyChaosAndLatency();

    let slots = this.slots.filter((s) => s.providerId === providerId);
    if (date) {
      slots = slots.filter((s) => s.date === date);
    }
    return slots;
  }

  async bookSlot(request: BookingRequest): Promise<BookingConfirmation> {
    await this.applyChaosAndLatency();

    const slotIndex = this.slots.findIndex((s) => s.id === request.slotId);
    if (slotIndex === -1) {
      throw new Error('Selected time slot could not be found.');
    }

    if (!this.slots[slotIndex].isAvailable) {
      throw new Error('This time slot was just booked by another patient. Please pick another slot.');
    }

    const provider = this.providers.find((p) => p.id === request.providerId);
    if (!provider) {
      throw new Error('Provider could not be found.');
    }

    // Mark slot as booked
    this.slots[slotIndex] = {
      ...this.slots[slotIndex],
      isAvailable: false,
    };

    // Update provider's remaining slot count
    const remainingSlots = this.slots.filter(
      (s) => s.providerId === provider.id && s.isAvailable
    ).length;
    const providerIndex = this.providers.findIndex((p) => p.id === provider.id);
    if (providerIndex !== -1) {
      this.providers[providerIndex] = {
        ...this.providers[providerIndex],
        availableSlotsCount: remainingSlots,
      };
    }

    const bookingId = `CS-${Math.floor(100000 + Math.random() * 900000)}`;

    const confirmation: BookingConfirmation = {
      bookingId,
      provider,
      slot: this.slots[slotIndex],
      patientName: request.patientName,
      email: request.email,
      phone: request.phone,
      reason: request.reason,
      insuranceProvider: request.insuranceProvider,
      notes: request.notes,
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
    };

    return confirmation;
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    await this.applyChaosAndLatency();
    // Booking cancellation logic
    return true;
  }

  /**
   * Helper to reset in-memory data back to initial seed.
   */
  resetData(): void {
    this.slots = generateInitialSlots();
    this.providers = generateInitialProviders(this.slots);
  }
}

export const mockApi = new MockCareSlotApi();

