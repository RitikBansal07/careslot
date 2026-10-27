import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthSession } from '../types/auth';

declare const Buffer: any;

export const AUTH_COOKIE_NAME = 'careslot_auth_token';
export const USER_COOKIE_NAME = 'careslot_user_data';

class CookieStorageService {
  /**
   * Set an HTTP-style cookie with path, max-age, and SameSite policy.
   * On Web: writes to document.cookie.
   * On Mobile / Node / Jest: writes to AsyncStorage.
   */
  async setCookie(name: string, value: string, days: number = 7): Promise<void> {
    const maxAgeSeconds = days * 24 * 60 * 60;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(
        value
      )}; path=/; max-age=${maxAgeSeconds}; expires=${expires}; SameSite=Lax`;
    }

    // Always mirror to AsyncStorage for unified cross-platform state
    try {
      await AsyncStorage.setItem(`cookie_${name}`, value);
    } catch (err) {
      console.warn('Failed to mirror cookie to AsyncStorage:', err);
    }
  }

  /**
   * Retrieve cookie value by name.
   */
  async getCookie(name: string): Promise<string | null> {
    // 1. Try browser document.cookie first if in web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
        if (cookieName === name) {
          return decodeURIComponent(cookieValueParts.join('='));
        }
      }
    }

    // 2. Fallback to AsyncStorage
    try {
      return await AsyncStorage.getItem(`cookie_${name}`);
    } catch {
      return null;
    }
  }

  /**
   * Delete cookie by setting max-age to 0 and past expiry.
   */
  async deleteCookie(name: string): Promise<void> {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }

    try {
      await AsyncStorage.removeItem(`cookie_${name}`);
    } catch (err) {
      console.warn('Failed to remove cookie from AsyncStorage:', err);
    }
  }

  /**
   * Generates a simulated JWT Bearer token:
   * Header.Payload.Signature (Base64-encoded)
   */
  generateAuthToken(user: AuthUser, expiresInDays: number = 7): { token: string; expiresAt: number } {
    const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt / 1000),
    };

    const encodeBase64 = (obj: object) => {
      const str = JSON.stringify(obj);
      if (typeof btoa !== 'undefined') {
        return btoa(str);
      }
      return Buffer.from(str).toString('base64');
    };

    const encodedHeader = encodeBase64(header);
    const encodedPayload = encodeBase64(payload);
    const signature = `cs_sig_${Math.random().toString(36).substring(2, 10)}`;

    return {
      token: `${encodedHeader}.${encodedPayload}.${signature}`,
      expiresAt,
    };
  }

  /**
   * Decodes and validates token payload
   */
  decodeAuthToken(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      const decodeBase64 = (str: string) => {
        if (typeof atob !== 'undefined') {
          return atob(str);
        }
        return Buffer.from(str, 'base64').toString('utf8');
      };

      const payloadJson = decodeBase64(parts[1]);
      const payload = JSON.parse(payloadJson);

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null; // Expired
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Saves active session into HTTP cookies
   */
  async saveSession(session: AuthSession): Promise<void> {
    await this.setCookie(AUTH_COOKIE_NAME, session.token, 7);
    await this.setCookie(USER_COOKIE_NAME, JSON.stringify(session.user), 7);
  }

  /**
   * Clears session cookies
   */
  async clearSession(): Promise<void> {
    await this.deleteCookie(AUTH_COOKIE_NAME);
    await this.deleteCookie(USER_COOKIE_NAME);
  }

  /**
   * Loads saved session from cookies if valid
   */
  async loadSession(): Promise<AuthSession | null> {
    const token = await this.getCookie(AUTH_COOKIE_NAME);
    const userJson = await this.getCookie(USER_COOKIE_NAME);

    if (!token || !userJson) {
      return null;
    }

    const payload = this.decodeAuthToken(token);
    if (!payload) {
      await this.clearSession();
      return null;
    }

    try {
      const user: AuthUser = JSON.parse(userJson);
      return {
        user,
        token,
        expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 7 * 86400000,
      };
    } catch {
      await this.clearSession();
      return null;
    }
  }
}

export const cookieStorage = new CookieStorageService();
