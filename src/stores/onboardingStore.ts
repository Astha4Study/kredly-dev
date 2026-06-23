import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  currentUserId: string | null; // Track current user to detect user change
  currentStep: 1 | 2 | 3;
  fullName: string;
  username: string;
  cvFile: File | null;
  cvFileName: string;
  cvImages: string[]; // Base64 images extracted from PDF for vision processing
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
  setCvImages: (images: string[]) => void;
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
  cvImages: [],
  experience: '',
  isStudent: null,
  degree: '',
  isCompleted: false,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
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

      setCvImages: (images) => set({ cvImages: images }),

      setExperience: (experience) => set({ experience }),

      setIsStudent: (isStudent) => set({ isStudent }),

      setDegree: (degree) => set({ degree }),

      setCompleted: (completed) => set({ isCompleted: completed }),

      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        currentStep: state.currentStep,
        fullName: state.fullName,
        username: state.username,
        cvFileName: state.cvFileName,
        experience: state.experience,
        isStudent: state.isStudent,
        degree: state.degree,
        isCompleted: state.isCompleted,
      }),
    },
  ),
);
