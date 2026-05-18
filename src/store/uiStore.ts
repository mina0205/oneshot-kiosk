// src/store/uiStore.ts
import { create } from 'zustand';
import { A2UIMessage } from '@/components/a2ui/A2UIRenderer';
import { Coupon } from '@/components/a2ui/CouponSelector';

interface UIStore {
  overrideMessages: A2UIMessage[] | null;
  setOverrideMessages: (messages: A2UIMessage[] | null) => void;
  
  isHomeRequested: boolean;
  goHome: () => void;
  resetHomeTrigger: () => void;

  // 쿠폰
  selectedCouponId: string | null;
  selectedCoupon: Coupon | null;           // 추가
  setSelectedCouponId: (id: string | null) => void;
  setSelectedCoupon: (coupon: Coupon | null) => void;  // 추가
}


export const useUIStore = create<UIStore>((set) => ({
  overrideMessages: null,
  setOverrideMessages: (messages) => set({ overrideMessages: messages }),
  
  isHomeRequested: false,
  goHome: () => set({ isHomeRequested: true }),
  resetHomeTrigger: () => set({ isHomeRequested: false }),

  selectedCouponId: null,
  setSelectedCouponId: (id) => set({ selectedCouponId: id }),

  selectedCoupon: null,
  setSelectedCoupon: (coupon) => set({ selectedCoupon: coupon }),
}));
