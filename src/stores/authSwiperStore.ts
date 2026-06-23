import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthSwiperState {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const useAuthSwiperStore = create<AuthSwiperState>()(
  persist(
    (set) => ({
      activeIndex: 0,
      setActiveIndex: (index: number) => set({ activeIndex: index }),
    }),
    {
      name: 'auth-swiper-storage',
    }
  )
);
