// [Cell 1]: src/store/uiStore.ts

import { create } from 'zustand';
import { A2UIMessage } from '@/components/a2ui/A2UIRenderer';
import { Coupon } from '@/components/a2ui/CouponSelector';

interface UIStore {
  overrideMessages: A2UIMessage[] | null;
  setOverrideMessages: (messages: A2UIMessage[] | null) => void;
  
  isHomeRequested: boolean;
  goHome: () => void;
  resetHomeTrigger: () => void;

  // 쿠폰 로직 유지
  selectedCouponId: string | null;
  selectedCoupon: Coupon | null;
  setSelectedCouponId: (id: string | null) => void;
  setSelectedCoupon: (coupon: Coupon | null) => void;

  // 🚀 시니어 접근성을 위한 UI 전역 상태 추가
  isHighContrast: boolean;
  fontSize: "normal" | "large";
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

  // 🚀 접근성 초기값 설정
  isHighContrast: false,
  fontSize: "normal",
}));