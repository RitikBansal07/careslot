import { ICareSlotApi } from './client';
import {
  Provider,
  TimeSlot,
  BookingRequest,
  BookingConfirmation,
  ProviderFilterParams,
} from '../types/domain';

/**
 * HttpCareSlotApi demonstrates the Adapter Pattern.
 * This class implements ICareSlotApi against a real RESTful API endpoint,
 * enabling seamless backend swap-in without touching any UI or hook logic.
 */
export class HttpCareSlotApi implements ICareSlotApi {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://api.careslot.demo/v1') {
    this.baseUrl = baseUrl;
  }

  async getProviders(params?: ProviderFilterParams): Promise<Provider[]> {
    const query = new URLSearchParams();
    if (params?.specialty) query.append('specialty', params.specialty);
    if (params?.search) query.append('q', params.search);

    const res = await fetch(`${this.baseUrl}/providers?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}: Failed to fetch providers`);
    return res.json();
  }

  async getProviderDetail(
    id: string
  ): Promise<{ provider: Provider; slots: TimeSlot[] } | null> {
    const res = await fetch(`${this.baseUrl}/providers/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP error ${res.status}: Failed to fetch provider details`);
    return res.json();
  }

  async getSlotsByProvider(providerId: string, date?: string): Promise<TimeSlot[]> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`${this.baseUrl}/providers/${providerId}/slots${query}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}: Failed to fetch slots`);
    return res.json();
  }

  async bookSlot(request: BookingRequest): Promise<BookingConfirmation> {
    const res = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to book appointment slot');
    }
    return res.json();
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }
}

