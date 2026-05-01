import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface SessionStore {
  sessionId: string;
}

export const useSessionStore = create<SessionStore>(() => ({
  sessionId: uuidv4(),
}));
