import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const USER_KEY = 'user_data';
const AUTH_KEY = 'is_authenticated';
const FAILED_ATTEMPTS_KEY = 'failed_login_attempts';
const LOCKOUT_UNTIL_KEY = 'lockout_until';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Secure storage helpers
const secureSet = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error setting secure store key ${key}:`, error);
    throw error;
  }
};

const secureGet = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting secure store key ${key}:`, error);
    return null;
  }
};

const secureDelete = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting secure store key ${key}:`, error);
  }
};

export const saveUserData = async (userData: User): Promise<void> => {
  try {
    // Normalize email to lowercase for case-insensitive storage
    const normalizedUserData: User = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
    };
    // Store user data securely (password is hashed in production, but for this demo we encrypt it)
    await secureSet(USER_KEY, JSON.stringify(normalizedUserData));
    await secureSet(AUTH_KEY, 'true');
    // Reset failed attempts on successful registration
    await secureDelete(FAILED_ATTEMPTS_KEY);
    await secureDelete(LOCKOUT_UNTIL_KEY);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    const userData = await secureGet(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const authStatus = await secureGet(AUTH_KEY);
    return authStatus === 'true';
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

export const isLockedOut = async (): Promise<boolean> => {
  try {
    const lockoutUntil = await secureGet(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntil) {
      return false;
    }
    const lockoutTime = parseInt(lockoutUntil, 10);
    const now = Date.now();
    if (now < lockoutTime) {
      return true;
    }
    // Lockout expired, clear it
    await secureDelete(LOCKOUT_UNTIL_KEY);
    await secureDelete(FAILED_ATTEMPTS_KEY);
    return false;
  } catch (error) {
    console.error('Error checking lockout status:', error);
    return false;
  }
};

export const getRemainingLockoutTime = async (): Promise<number> => {
  try {
    const lockoutUntil = await secureGet(LOCKOUT_UNTIL_KEY);
    if (!lockoutUntil) {
      return 0;
    }
    const lockoutTime = parseInt(lockoutUntil, 10);
    const now = Date.now();
    return Math.max(0, lockoutTime - now);
  } catch (error) {
    console.error('Error getting lockout time:', error);
    return 0;
  }
};

const incrementFailedAttempts = async (): Promise<number> => {
  try {
    const attemptsStr = await secureGet(FAILED_ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) + 1 : 1;
    await secureSet(FAILED_ATTEMPTS_KEY, attempts.toString());

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      await secureSet(LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
    }

    return attempts;
  } catch (error) {
    console.error('Error incrementing failed attempts:', error);
    return 0;
  }
};

const resetFailedAttempts = async (): Promise<void> => {
  try {
    await secureDelete(FAILED_ATTEMPTS_KEY);
    await secureDelete(LOCKOUT_UNTIL_KEY);
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
};

export interface LoginResult {
  success: boolean;
  message?: string;
  attemptsRemaining?: number;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    // Check if account is locked out
    const lockedOut = await isLockedOut();
    if (lockedOut) {
      const remainingTime = await getRemainingLockoutTime();
      const minutes = Math.ceil(remainingTime / 60000);
      return {
        success: false,
        message: `Account locked. Please try again in ${minutes} minute(s).`,
      };
    }

    const userData = await getUserData();
    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();
    if (userData && userData.email === normalizedEmail && userData.password === password) {
      // Successful login - reset failed attempts
      await resetFailedAttempts();
      await secureSet(AUTH_KEY, 'true');
      return { success: true };
    }

    // Failed login - increment attempts
    const attempts = await incrementFailedAttempts();
    const attemptsRemaining = MAX_FAILED_ATTEMPTS - attempts;

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      return {
        success: false,
        message: `Too many failed attempts. Account locked for 15 minutes.`,
        attemptsRemaining: 0,
      };
    }

    return {
      success: false,
      message: 'Invalid email or password.',
      attemptsRemaining,
    };
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'An error occurred during login. Please try again.',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await secureSet(AUTH_KEY, 'false');
    // Note: We keep user data for auto-login, but clear auth status
    // To fully clear, use clearAllData()
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await secureDelete(USER_KEY);
    await secureDelete(AUTH_KEY);
    await secureDelete(FAILED_ATTEMPTS_KEY);
    await secureDelete(LOCKOUT_UNTIL_KEY);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

// Biometric authentication
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return false;
    }
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

export const authenticateWithBiometric = async (): Promise<boolean> => {
  try {
    const available = await isBiometricAvailable();
    if (!available) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to login',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // Biometric auth successful, check if user data exists and auto-login
      const userData = await getUserData();
      if (userData) {
        await secureSet(AUTH_KEY, 'true');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error during biometric authentication:', error);
    return false;
  }
};
