import { create } from 'zustand';

interface DebugStoreState {
  latencyMs: number;
  failureRate: number; // 0 to 1
  forceEmptyState: boolean;
  forceLoadingState: boolean;
  setLatencyMs: (ms: number) => void;
  setFailureRate: (rate: number) => void;
  setForceEmptyState: (enabled: boolean) => void;
  setForceLoadingState: (enabled: boolean) => void;
  resetDefaults: () => void;
}

export const useDebugStore = create<DebugStoreState>((set) => ({
  latencyMs: 0,
  failureRate: 0,
  forceEmptyState: false,
  forceLoadingState: false,

  setLatencyMs: (latencyMs: number) => set({ latencyMs }),
  setFailureRate: (failureRate: number) => set({ failureRate }),
  setForceEmptyState: (forceEmptyState: boolean) => set({ forceEmptyState }),
  setForceLoadingState: (forceLoadingState: boolean) => set({ forceLoadingState }),
  resetDefaults: () =>
    set({
      latencyMs: 0,
      failureRate: 0,
      forceEmptyState: false,
      forceLoadingState: false,
    }),
}));
