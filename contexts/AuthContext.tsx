import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isAuthenticated,
  getUserData,
  logout as logoutUser,
  login as loginUser,
  authenticateWithBiometric,
  isBiometricAvailable,
  User,
  LoginResult,
} from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthenticatedUser: (user: User) => void;
  biometricLogin: () => Promise<boolean>;
  isBiometricEnabled: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userData = await getUserData();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        const userData = await getUserData();
        setUser(userData);
        setIsLoggedIn(true);
      }
      return result;
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.',
      };
    }
  };

  const biometricLogin = async (): Promise<boolean> => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        const userData = await getUserData();
        setUser(userData);
        setIsLoggedIn(true);
      }
      return success;
    } catch (error) {
      console.error('Error during biometric login:', error);
      return false;
    }
  };

  const isBiometricEnabled = async (): Promise<boolean> => {
    return await isBiometricAvailable();
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const setAuthenticatedUser = (user: User) => {
    setUser(user);
    setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        login,
        logout,
        setUser,
        setAuthenticatedUser,
        biometricLogin,
        isBiometricEnabled,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

