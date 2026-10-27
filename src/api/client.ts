import {
  Provider,
  TimeSlot,
  BookingRequest,
  BookingConfirmation,
  ProviderFilterParams,
} from '../types/domain';

export interface ICareSlotApi {
  /**
   * Fetches the list of providers, optionally filtered by specialty or search query.
   */
  getProviders(params?: ProviderFilterParams): Promise<Provider[]>;

  /**
   * Fetches provider details by ID along with their available time slots.
   */
  getProviderDetail(id: string): Promise<{ provider: Provider; slots: TimeSlot[] } | null>;

  /**
   * Fetches time slots for a given provider, optionally filtered by date.
   */
  getSlotsByProvider(providerId: string, date?: string): Promise<TimeSlot[]>;

  /**
   * Books a slot with patient information.
   */
  bookSlot(request: BookingRequest): Promise<BookingConfirmation>;

  /**
   * Cancels an existing booking.
   */
  cancelBooking(bookingId: string): Promise<boolean>;
}

