// [Cell 1]: src/store/uiStore.ts

import { create } from 'zustand';
import { A2UIMessage } from '@/components/a2ui/A2UIRenderer';

interface UIStore {
  overrideMessages: A2UIMessage[] | null;
  setOverrideMessages: (messages: A2UIMessage[] | null) => void;
  
  // 🚀 홈 화면 복귀를 위한 신호탄 상태 추가
  isHomeRequested: boolean;
  goHome: () => void;
  resetHomeTrigger: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  overrideMessages: null,
  setOverrideMessages: (messages) => set({ overrideMessages: messages }),
  
  isHomeRequested: false,
  goHome: () => set({ isHomeRequested: true }), // 신호탄 쏘기!
  resetHomeTrigger: () => set({ isHomeRequested: false }), // 신호탄 끄기
}));