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
  SLOT_SCHEDULES,
} from './mockData';
import { getNextSevenDays } from '../utils/dateHelpers';
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

    const visitType = request.visitType || 'telehealth';
    const isTelehealth = visitType === 'telehealth';

    const confirmation: BookingConfirmation = {
      bookingId,
      provider,
      slot: this.slots[slotIndex],
      patientName: request.patientName,
      email: request.email,
      phone: request.phone,
      reason: request.reason,
      insuranceProvider: request.insuranceProvider,
      visitType,
      telehealthChannelId: isTelehealth ? `careslot-${bookingId.toLowerCase()}` : undefined,
      telehealthDoctorStatus: isTelehealth ? 'waiting' : undefined,
      consultationNotes: isTelehealth
        ? `Patient presented with ${request.reason}. Comprehensive clinical review conducted. Advised adequate hydration, rest, and recommended follow-up in 10 days if symptoms persist.`
        : undefined,
      prescriptions: isTelehealth
        ? [
            'Supportive Care Protocol — 1 dose oral daily for 5 days',
            'Symptomatic Hydration Therapy (electrolytes PRN)',
            'Follow-up wellness consult in 2 weeks',
          ]
        : undefined,
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
   * Registers a newly signed up Doctor into the in-memory provider directory & time slots
   */
  registerDoctor(data: {
    name: string;
    specialty: any;
    clinicName: string;
    consultationFee: number;
    phone: string;
    bio?: string;
  }): Provider {
    const id = `p-${Date.now()}`;
    const dates = getNextSevenDays();
    const newSlots: TimeSlot[] = [];

    dates.forEach((dateStr) => {
      SLOT_SCHEDULES.forEach((sched) => {
        newSlots.push({
          id: `slot-${id}-${dateStr}-${sched.startTime.replace(/[^a-zA-Z0-9]/g, '')}`,
          providerId: id,
          date: dateStr,
          startTime: sched.startTime,
          endTime: sched.endTime,
          period: sched.period,
          isAvailable: true,
        });
      });
    });

    this.slots = [...newSlots, ...this.slots];

    const newProvider: Provider = {
      id,
      name: data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`,
      title: 'MD, FACP',
      specialty: data.specialty,
      rating: 5.0,
      reviewCount: 1,
      experienceYears: 8,
      bio: data.bio || `Specialist in ${data.specialty} providing compassionate telehealth and clinical care.`,
      location: {
        clinicName: data.clinicName || 'CareSlot Health Center',
        address: '100 Medical Plaza, Suite 400',
        city: 'New York',
        state: 'NY',
        distanceMiles: 1.2,
      },
      consultationFee: data.consultationFee || 130,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      languages: ['English'],
      acceptedInsurances: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare'],
      nextAvailableDate: dates[0] || 'Today',
      availableSlotsCount: newSlots.length,
    };

    this.providers = [newProvider, ...this.providers];
    return newProvider;
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

