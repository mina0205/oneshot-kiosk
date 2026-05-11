import { create } from "zustand";

interface ChatStore {
  sendMessage: ((message: string) => void) | null;
  setSendMessage: (fn: (message: string) => void) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  sendMessage: null,
  setSendMessage: (fn) => set({ sendMessage: fn }),
}));
