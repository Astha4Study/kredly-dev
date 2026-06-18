import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  hasCompletedOnboarding?: boolean; // Tambahan untuk cek status onboarding
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => void;
  signInWithEmailOTP: (
    email: string,
    type?: 'sign-in' | 'sign-up',
  ) => Promise<{ success: boolean; message: string }>;
  verifyEmailOTP: (
    email: string,
    otp: string,
    type?: 'sign-in' | 'sign-up',
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user session
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/get-session', {
        credentials: 'include', // Important: kirim cookie
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check session on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Sign in with Google (redirect to OAuth)
  const signInWithGoogle = () => {
    window.location.href = '/api/auth/sign-in/google';
  };

  // Send OTP to Email
  const signInWithEmailOTP = async (
    email: string,
    type: 'sign-in' | 'sign-up' = 'sign-in',
  ) => {
    try {
      const response = await fetch('/api/auth/sign-in/email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'OTP berhasil dikirim',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Gagal mengirim OTP',
        };
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return { success: false, message: 'Gagal mengirim OTP' };
    }
  };

  // Verify OTP and Login
  const verifyEmailOTP = async (
    email: string,
    otp: string,
    type: 'sign-in' | 'sign-up' = 'sign-in',
  ) => {
    try {
      const response = await fetch('/api/auth/verify/email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, type }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return {
          success: true,
          message: data.message || 'Verifikasi berhasil',
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Kode OTP tidak valid',
        };
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return { success: false, message: 'Gagal memverifikasi OTP' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);

      // Clear any localStorage data when user logs out
      localStorage.clear();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Refetch user (for manual refresh)
  const refetch = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmailOTP,
    verifyEmailOTP,
    signOut,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
