import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingConfirmation } from '../types/domain';
import { createDemoInitialBookings } from '../api/mockData';

interface FavoritesStoreState {
  favoriteIds: string[];
  bookings: BookingConfirmation[];
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
  addBooking: (booking: BookingConfirmation) => void;
  cancelBooking: (bookingId: string) => void;
  clearAll: () => void;
}

const broadcastSync = (type: string, payload: any) => {
  if (typeof window !== 'undefined') {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('careslot_sync_bookings');
        channel.postMessage({ type, ...payload });
      }
      window.localStorage.setItem(
        'careslot_last_sync_event',
        JSON.stringify({ type, ...payload, timestamp: Date.now() })
      );
    } catch {}
  }
};

export const useFavoritesStore = create<FavoritesStoreState>()(
  persist(
    (set, get) => ({
      favoriteIds: ['p-1', 'p-4'], // Initial favorites for immediate demo delight
      bookings: createDemoInitialBookings(), // Initial seeded booking for Dr. Sarah Jenkins & Alex Morgan

      toggleFavorite: (providerId: string) => {
        const { favoriteIds } = get();
        const exists = favoriteIds.includes(providerId);
        set({
          favoriteIds: exists
            ? favoriteIds.filter((id) => id !== providerId)
            : [...favoriteIds, providerId],
        });
      },

      isFavorite: (providerId: string) => {
        return get().favoriteIds.includes(providerId);
      },

      addBooking: (booking: BookingConfirmation) => {
        set((state) => {
          const updated = [booking, ...state.bookings.filter((b) => b.bookingId !== booking.bookingId)];
          broadcastSync('ADD_BOOKING', { booking, bookings: updated });
          return { bookings: updated };
        });
      },

      cancelBooking: (bookingId: string) => {
        set((state) => {
          const updated = state.bookings.map((b) =>
            b.bookingId === bookingId ? { ...b, status: 'cancelled' as const } : b
          );
          broadcastSync('CANCEL_BOOKING', { bookingId, bookings: updated });
          return { bookings: updated };
        });
      },

      clearAll: () => {
        set({ favoriteIds: [], bookings: [] });
      },
    }),
    {
      name: 'careslot-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Cross-tab real-time sync listeners for multi-window demonstrations
if (typeof window !== 'undefined') {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('careslot_sync_bookings');
      channel.onmessage = (event) => {
        if (event.data?.bookings && Array.isArray(event.data.bookings)) {
          useFavoritesStore.setState({ bookings: event.data.bookings });
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'careslot_last_sync_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.bookings && Array.isArray(parsed.bookings)) {
            useFavoritesStore.setState({ bookings: parsed.bookings });
          } else if (parsed.type === 'ADD_BOOKING' && parsed.booking) {
            const current = useFavoritesStore.getState().bookings;
            if (!current.some((b) => b.bookingId === parsed.booking.bookingId)) {
              useFavoritesStore.setState({ bookings: [parsed.booking, ...current] });
            }
          } else if (parsed.type === 'CANCEL_BOOKING' && parsed.bookingId) {
            const current = useFavoritesStore.getState().bookings;
            useFavoritesStore.setState({
              bookings: current.map((b) =>
                b.bookingId === parsed.bookingId ? { ...b, status: 'cancelled' as const } : b
              ),
            });
          }
        } catch {}
      }
    });
  } catch {}
}

