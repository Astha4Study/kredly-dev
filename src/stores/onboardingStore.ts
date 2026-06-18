import { create } from 'zustand';

interface OnboardingState {
  currentUserId: string | null; // Track current user to detect user change
  currentStep: 1 | 2 | 3;
  fullName: string;
  username: string;
  cvFile: File | null;
  cvFileName: string;
  experience: string;
  isStudent: boolean | null;
  degree: string;
  isCompleted: boolean;
}

interface OnboardingActions {
  setUserId: (userId: string) => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setFullName: (name: string) => void;
  setUsername: (username: string) => void;
  setCvFile: (file: File | null) => void;
  setExperience: (experience: string) => void;
  setIsStudent: (isStudent: boolean | null) => void;
  setDegree: (degree: string) => void;
  setCompleted: (completed: boolean) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  currentUserId: null,
  currentStep: 1,
  fullName: '',
  username: '',
  cvFile: null,
  cvFileName: '',
  experience: '',
  isStudent: null,
  degree: '',
  isCompleted: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  (set) => ({
    ...initialState,

    setUserId: (userId) => set({ currentUserId: userId }),

    setCurrentStep: (step) => set({ currentStep: step }),

    setFullName: (name) => set({ fullName: name }),

    setUsername: (username) => set({ username }),

    setCvFile: (file) =>
      set({
        cvFile: file,
        cvFileName: file ? file.name : '',
      }),

    setExperience: (experience) => set({ experience }),

    setIsStudent: (isStudent) => set({ isStudent }),

    setDegree: (degree) => set({ degree }),

    setCompleted: (completed) => set({ isCompleted: completed }),

    reset: () => set(initialState),
  }),
);
