import { cookieStorage, AUTH_COOKIE_NAME, USER_COOKIE_NAME } from '../src/services/cookieStorage';
import { useAuthStore } from '../src/store/useAuthStore';
import { AuthUser } from '../src/types/auth';

describe('Authentication & HTTP Cookie Token Architecture', () => {
  const mockPatient: AuthUser = {
    id: 'usr-test-1',
    name: 'Alex Test',
    email: 'test.patient@example.com',
    role: 'patient',
  };

  beforeEach(async () => {
    await cookieStorage.clearSession();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });

  describe('HTTP Cookie Storage Service', () => {
    it('sets, retrieves, and deletes cookies', async () => {
      await cookieStorage.setCookie('test_cookie', 'sample_value_123', 7);
      const val = await cookieStorage.getCookie('test_cookie');
      expect(val).toBe('sample_value_123');

      await cookieStorage.deleteCookie('test_cookie');
      const deletedVal = await cookieStorage.getCookie('test_cookie');
      expect(deletedVal).toBeNull();
    });

    it('generates a valid simulated JWT Bearer token with expiration', () => {
      const { token, expiresAt } = cookieStorage.generateAuthToken(mockPatient, 7);

      expect(token).toBeDefined();
      const parts = token.split('.');
      expect(parts.length).toBe(3); // Header.Payload.Signature
      expect(expiresAt).toBeGreaterThan(Date.now());

      const payload = cookieStorage.decodeAuthToken(token);
      expect(payload).toBeDefined();
      expect(payload.sub).toBe(mockPatient.id);
      expect(payload.name).toBe(mockPatient.name);
      expect(payload.email).toBe(mockPatient.email);
      expect(payload.role).toBe('patient');
    });

    it('saves and loads active session into persistent cookies', async () => {
      const { token, expiresAt } = cookieStorage.generateAuthToken(mockPatient);
      await cookieStorage.saveSession({ user: mockPatient, token, expiresAt });

      const loadedSession = await cookieStorage.loadSession();
      expect(loadedSession).not.toBeNull();
      expect(loadedSession?.user.email).toBe(mockPatient.email);
      expect(loadedSession?.token).toBe(token);
      expect(loadedSession?.user.role).toBe('patient');
    });
  });

  describe('Mock Accounts & Auth Store', () => {
    it('authenticates patient mock account with correct credentials', async () => {
      const user = await useAuthStore.getState().login({
        email: 'patient@example.com',
        password: 'patient123',
      });

      expect(user.role).toBe('patient');
      expect(user.name).toBe('Alex Morgan');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().token).toBeDefined();

      // Cookie should be saved
      const savedCookie = await cookieStorage.getCookie(AUTH_COOKIE_NAME);
      expect(savedCookie).toBeDefined();
    });

    it('authenticates doctor mock account with clinical credentials', async () => {
      const user = await useAuthStore.getState().login({
        email: 'doctor@careslot.com',
        password: 'doctor123',
      });

      expect(user.role).toBe('doctor');
      expect(user.name).toBe('Dr. Sarah Jenkins');
      expect(user.doctorId).toBe('p-1');
      expect(user.specialty).toBe('Primary Care');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('authenticates admin mock account with administrative credentials', async () => {
      const user = await useAuthStore.getState().login({
        email: 'admin@careslot.com',
        password: 'admin123',
      });

      expect(user.role).toBe('admin');
      expect(user.name).toBe('Elena Rostova');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('rejects invalid credentials with an error', async () => {
      await expect(
        useAuthStore.getState().login({
          email: 'wrong@example.com',
          password: 'badpassword',
        })
      ).rejects.toThrow(/invalid email or password/i);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toMatch(/invalid email or password/i);
    });

    it('allows 1-click mock login for all roles', async () => {
      const doctorUser = await useAuthStore.getState().loginAsMock('doctor');
      expect(doctorUser.role).toBe('doctor');

      const adminUser = await useAuthStore.getState().loginAsMock('admin');
      expect(adminUser.role).toBe('admin');

      const patientUser = await useAuthStore.getState().loginAsMock('patient');
      expect(patientUser.role).toBe('patient');
    });

    it('clears cookies and state on logout', async () => {
      await useAuthStore.getState().loginAsMock('patient');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      await useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();

      const cookie = await cookieStorage.getCookie(AUTH_COOKIE_NAME);
      expect(cookie).toBeNull();
    });

    it('restores authenticated session from cookies on initialize()', async () => {
      // 1. Simulate existing session in cookies
      const { token, expiresAt } = cookieStorage.generateAuthToken(mockPatient);
      await cookieStorage.saveSession({ user: mockPatient, token, expiresAt });

      // 2. Initialize fresh store
      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe(mockPatient.email);
      expect(useAuthStore.getState().token).toBe(token);
    });
  });
});
