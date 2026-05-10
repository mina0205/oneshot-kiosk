// src/store/uiStore.ts
import { create } from 'zustand';
import { A2UIMessage } from '@/components/a2ui/A2UIRenderer';

interface UIStore {
  overrideMessages: A2UIMessage[] | null;
  setOverrideMessages: (messages: A2UIMessage[] | null) => void;
  
  isHomeRequested: boolean;
  goHome: () => void;
  resetHomeTrigger: () => void;

  // 쿠폰
  selectedCouponId: string | null;
  setSelectedCouponId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  overrideMessages: null,
  setOverrideMessages: (messages) => set({ overrideMessages: messages }),
  
  isHomeRequested: false,
  goHome: () => set({ isHomeRequested: true }),
  resetHomeTrigger: () => set({ isHomeRequested: false }),

  selectedCouponId: null,
  setSelectedCouponId: (id) => set({ selectedCouponId: id }),
}));
