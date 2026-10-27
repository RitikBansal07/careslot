import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingConfirmation } from '../types/domain';

interface FavoritesStoreState {
  favoriteIds: string[];
  bookings: BookingConfirmation[];
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
  addBooking: (booking: BookingConfirmation) => void;
  cancelBooking: (bookingId: string) => void;
  clearAll: () => void;
}

export const useFavoritesStore = create<FavoritesStoreState>()(
  persist(
    (set, get) => ({
      favoriteIds: ['p-1', 'p-4'], // Initial favorites for immediate demo delight
      bookings: [],

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
        set((state) => ({
          bookings: [booking, ...state.bookings],
        }));
      },

      cancelBooking: (bookingId: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.bookingId === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        }));
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

