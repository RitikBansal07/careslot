import { create } from 'zustand';
import { AuthUser, LoginCredentials, UserRole } from '../types/auth';
import { MOCK_ACCOUNTS } from '../api/mockAuthData';
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

    const account = MOCK_ACCOUNTS.find(
      (acc) =>
        acc.user.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
        acc.password === credentials.password
    );

    if (!account) {
      const err = 'Invalid email or password. Please use a valid mock credential.';
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

