// [Cell 1]: src/store/uiStore.ts

import { create } from 'zustand';
import { A2UIMessage } from '@/components/a2ui/A2UIRenderer';
import { Coupon } from '@/components/a2ui/CouponSelector';

// ✅ 세트 옵션 선택 모달용 타입
interface SetMenuInfo {
  menuId: string;
  menuName: string;
  menuPrice: number;
  setPrice: number;
  image?: string;
}

interface UIStore {
  overrideMessages: A2UIMessage[] | null;
  setOverrideMessages: (messages: A2UIMessage[] | null) => void;

  isHomeRequested: boolean;
  goHome: () => void;
  resetHomeTrigger: () => void;

  // 쿠폰 로직
  selectedCouponId: string | null;
  selectedCoupon: Coupon | null;
  setSelectedCouponId: (id: string | null) => void;
  setSelectedCoupon: (coupon: Coupon | null) => void;

  // 시니어 접근성
  isHighContrast: boolean;
  fontSize: "normal" | "large";

  // ✅ 세트 옵션 모달 상태
  activeSetMenu: SetMenuInfo | null;
  openSetMenu: (info: SetMenuInfo) => void;
  closeSetMenu: () => void;
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

  isHighContrast: false,
  fontSize: "normal",

  // ✅ 세트 옵션 모달 초기값
  activeSetMenu: null,
  openSetMenu: (info) => set({ activeSetMenu: info }),
  closeSetMenu: () => set({ activeSetMenu: null }),
}));
