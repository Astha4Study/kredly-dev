import type React from 'react';
import { useEffect, useState } from 'react';
import type { User, AuthContextType } from './types';
import { AuthContext } from './context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Shared fetch logic (no state updates)
  const getUserSession = async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/get-session', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  };

  // Fetch current user session (used by refetch)
  const fetchUser = async () => {
    const user = await getUserSession();
    setUser(user);
    setIsLoading(false);
  };

  // Check session on mount
  useEffect(() => {
    (async () => {
      const user = await getUserSession();
      setUser(user);
      setIsLoading(false);
    })();
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
