/**
 * Auth utility tests
 * Note: These tests mock SecureStore since it requires native modules
 */

import * as SecureStore from 'expo-secure-store';
import {
  saveUserData,
  getUserData,
  isAuthenticated,
  login,
  logout,
  isLockedOut,
  getRemainingLockoutTime,
} from '../auth';
import type { User } from '../auth';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
}));

describe('Auth Utilities', () => {
  const mockUser: User = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  describe('saveUserData', () => {
    test('should save user data and set authenticated status', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await saveUserData(mockUser);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(mockUser),
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('is_authenticated', 'true');
    });

    test('should normalize email to lowercase when saving', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      const userWithUppercaseEmail = { ...mockUser, email: 'TEST@EXAMPLE.COM' };

      await saveUserData(userWithUppercaseEmail);

      const normalizedUser = { ...userWithUppercaseEmail, email: 'test@example.com' };
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(normalizedUser),
      );
    });

    test('should reset failed attempts on save', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await saveUserData(mockUser);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('failed_login_attempts');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('lockout_until');
    });
  });

  describe('getUserData', () => {
    test('should retrieve user data', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

      const result = await getUserData();

      expect(result).toEqual(mockUser);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('user_data');
    });

    test('should return null if no user data exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await getUserData();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when authenticated', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('true');

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    test('should return false when not authenticated', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('false');

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    test('should login successfully with correct credentials', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user_data') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        return Promise.resolve(null);
      });
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await login(mockUser.email, mockUser.password);

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('is_authenticated', 'true');
    });

    test('should login successfully with case-insensitive email', async () => {
      // Store user with lowercase email
      const userWithLowercaseEmail = { ...mockUser, email: mockUser.email.toLowerCase() };
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user_data') {
          return Promise.resolve(JSON.stringify(userWithLowercaseEmail));
        }
        return Promise.resolve(null);
      });
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Try to login with uppercase email
      const result = await login(mockUser.email.toUpperCase(), mockUser.password);

      expect(result.success).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('is_authenticated', 'true');
    });

    test('should fail login with incorrect credentials', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user_data') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        if (key === 'failed_login_attempts') {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await login('wrong@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid email or password');
    });

    test('should lock account after 5 failed attempts', async () => {
      let attempts = 0;
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'user_data') {
          return Promise.resolve(JSON.stringify(mockUser));
        }
        if (key === 'failed_login_attempts') {
          return Promise.resolve(attempts.toString());
        }
        return Promise.resolve(null);
      });
      (SecureStore.setItemAsync as jest.Mock).mockImplementation((key: string, value: string) => {
        if (key === 'failed_login_attempts') {
          attempts = parseInt(value, 10);
        }
        return Promise.resolve(undefined);
      });

      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await login('wrong@example.com', 'wrongpassword');
      }

      const finalResult = await login('wrong@example.com', 'wrongpassword');
      expect(finalResult.success).toBe(false);
      expect(finalResult.message).toContain('locked');
    });

    test('should prevent login when account is locked', async () => {
      const lockoutTime = Date.now() + 15 * 60 * 1000;
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'lockout_until') {
          return Promise.resolve(lockoutTime.toString());
        }
        return Promise.resolve(null);
      });

      const result = await login(mockUser.email, mockUser.password);

      expect(result.success).toBe(false);
      expect(result.message).toContain('locked');
    });
  });

  describe('logout', () => {
    test('should set authenticated status to false', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await logout();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('is_authenticated', 'false');
    });
  });

  describe('isLockedOut', () => {
    test('should return true when locked out', async () => {
      const lockoutTime = Date.now() + 15 * 60 * 1000;
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(lockoutTime.toString());

      const result = await isLockedOut();

      expect(result).toBe(true);
    });

    test('should return false when not locked out', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await isLockedOut();

      expect(result).toBe(false);
    });

    test('should clear lockout when expired', async () => {
      const expiredTime = Date.now() - 1000;
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(expiredTime.toString());
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await isLockedOut();

      expect(result).toBe(false);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('getRemainingLockoutTime', () => {
    test('should return remaining lockout time', async () => {
      const lockoutTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(lockoutTime.toString());

      const result = await getRemainingLockoutTime();

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(5 * 60 * 1000);
    });

    test('should return 0 when not locked out', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await getRemainingLockoutTime();

      expect(result).toBe(0);
    });
  });
});
