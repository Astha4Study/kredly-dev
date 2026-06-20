export interface User {
  id: string;
  email: string;
  name: string;
  username?: string; // Optional karena bisa null dari backend
  emailVerified: boolean;
  image?: string;
  hasCompletedOnboarding?: boolean;
  cvRole?: string;
  cvLevel?: string;
  cvSkills?: string[];
  cvSummary?: string;
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
