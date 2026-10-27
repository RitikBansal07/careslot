import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from './mockApi';
import { ProviderFilterParams, BookingRequest } from '../types/domain';
import { useFavoritesStore } from '../store/useFavoritesStore';

export const careSlotKeys = {
  all: ['careslot'] as const,
  providers: (filters?: ProviderFilterParams) => ['careslot', 'providers', filters] as const,
  providerDetail: (id: string) => ['careslot', 'provider', id] as const,
  providerSlots: (providerId: string, date?: string) =>
    ['careslot', 'slots', providerId, date] as const,
};

export function useProviders(filters?: ProviderFilterParams) {
  return useQuery({
    queryKey: careSlotKeys.providers(filters),
    queryFn: () => mockApi.getProviders(filters),
  });
}

export function useProviderDetail(providerId: string) {
  return useQuery({
    queryKey: careSlotKeys.providerDetail(providerId),
    queryFn: () => mockApi.getProviderDetail(providerId),
    enabled: Boolean(providerId),
  });
}

export function useSlotsByProvider(providerId: string, date?: string) {
  return useQuery({
    queryKey: careSlotKeys.providerSlots(providerId, date),
    queryFn: () => mockApi.getSlotsByProvider(providerId, date),
    enabled: Boolean(providerId),
  });
}

export function useBookSlot() {
  const queryClient = useQueryClient();
  const addBookingToStore = useFavoritesStore((state) => state.addBooking);

  return useMutation({
    mutationFn: (request: BookingRequest) => mockApi.bookSlot(request),
    onSuccess: (confirmation) => {
      // Persist in local storage state
      addBookingToStore(confirmation);
      // Invalidate queries so slot lists and remaining counts refresh instantly
      queryClient.invalidateQueries({ queryKey: careSlotKeys.all });
    },
  });
}

