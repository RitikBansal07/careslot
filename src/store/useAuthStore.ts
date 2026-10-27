import { create } from 'zustand';
import { AuthUser, LoginCredentials, UserRole, SignupPayload } from '../types/auth';
import {
  MOCK_ACCOUNTS,
  findRegisteredAccount,
  addRegisteredAccount,
} from '../api/mockAuthData';
import { mockApi } from '../api/mockApi';
import { cookieStorage } from '../services/cookieStorage';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  signup: (payload: SignupPayload) => Promise<AuthUser>;
  loginAsMock: (role: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const session = await cookieStorage.loadSession();
      if (session) {
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    set({ isLoading: true, error: null });

    // Simulated network verification delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    const account = findRegisteredAccount(credentials.email);

    if (!account || account.password !== credentials.password) {
      const err = 'Invalid email or password. Please use a valid registered credential.';
      set({ isLoading: false, error: err });
      throw new Error(err);
    }

    const { token, expiresAt } = cookieStorage.generateAuthToken(account.user);

    await cookieStorage.saveSession({
      user: account.user,
      token,
      expiresAt,
    });

    set({
      user: account.user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return account.user;
  },

  signup: async (payload: SignupPayload): Promise<AuthUser> => {
    set({ isLoading: true, error: null });

    await new Promise((resolve) => setTimeout(resolve, 400));

    // Security check: Admin accounts cannot be created via signup page
    if ((payload as any).role === 'admin') {
      const err = 'Administrator accounts cannot be created via the registration portal.';
      set({ isLoading: false, error: err });
      throw new Error(err);
    }

    const existing = findRegisteredAccount(payload.email);
    if (existing) {
      const err = 'An account with this email address already exists. Please sign in instead.';
      set({ isLoading: false, error: err });
      throw new Error(err);
    }

    let newUser: AuthUser;

    if (payload.role === 'doctor') {
      // 1. Add doctor to in-memory clinic provider directory and generate appointment slots
      const newProvider = mockApi.registerDoctor({
        name: payload.name,
        specialty: payload.specialty,
        clinicName: payload.clinicName,
        consultationFee: payload.consultationFee,
        phone: payload.phone,
        bio: payload.bio,
      });

      newUser = {
        id: `usr-doctor-${Date.now()}`,
        name: newProvider.name,
        email: payload.email.trim().toLowerCase(),
        role: 'doctor',
        doctorId: newProvider.id,
        specialty: payload.specialty,
        licenseNumber: payload.licenseNumber,
        clinicName: payload.clinicName,
        avatarUrl: newProvider.avatarUrl,
        phone: payload.phone,
      };

      addRegisteredAccount({
        user: newUser,
        password: payload.password,
        badgeLabel: 'Registered Physician',
        badgeColor: '#16A34A',
        description: `Physician at ${payload.clinicName} (${payload.specialty}).`,
      });
    } else {
      // Patient signup
      newUser = {
        id: `usr-patient-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        role: 'patient',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: payload.phone,
      };

      addRegisteredAccount({
        user: newUser,
        password: payload.password,
        badgeLabel: 'Verified Patient',
        badgeColor: '#0284C7',
        description: 'Registered patient account.',
      });
    }

    // Save session in HTTP cookies
    const { token, expiresAt } = cookieStorage.generateAuthToken(newUser);
    await cookieStorage.saveSession({
      user: newUser,
      token,
      expiresAt,
    });

    set({
      user: newUser,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return newUser;
  },

  loginAsMock: async (role: UserRole): Promise<AuthUser> => {
    set({ isLoading: true, error: null });

    await new Promise((resolve) => setTimeout(resolve, 200));

    const account = MOCK_ACCOUNTS.find((acc) => acc.user.role === role);
    if (!account) {
      const err = `No mock account found for role "${role}"`;
      set({ isLoading: false, error: err });
      throw new Error(err);
    }

    const { token, expiresAt } = cookieStorage.generateAuthToken(account.user);

    await cookieStorage.saveSession({
      user: account.user,
      token,
      expiresAt,
    });

    set({
      user: account.user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return account.user;
  },

  logout: async () => {
    set({ isLoading: true });
    await cookieStorage.clearSession();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

