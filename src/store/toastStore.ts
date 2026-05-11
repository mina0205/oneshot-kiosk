import { create } from "zustand";

interface ToastStore {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  message: null,

  showToast: (message) => {
    if (timer) clearTimeout(timer);

    set({ message });

    timer = setTimeout(() => {
      set({ message: null });
    }, 1600);
  },

  hideToast: () => set({ message: null }),
}));
