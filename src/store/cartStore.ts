import { create } from "zustand";
import { CartItem } from "../types/kiosk";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function syncAddToBackend(sessionId: string, item: CartItem) {
  try {
    await fetch(`${API_BASE_URL}/cart/${sessionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menuId: item.menuId,
        isSet: item.isSet || false,
        quantity: item.quantity,
        selectedSide: item.selectedSide || null,
        selectedDrink: item.selectedDrink || null,
        drinkSize: item.drinkSize || "R",
        toppings: item.toppings || [],
      }),
    });
  } catch (err) {
    console.warn("BE 장바구니 동기화 실패:", err);
  }
}

async function syncRemoveFromBackend(sessionId: string, cartItemId: string) {
  try {
    await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("BE 장바구니 삭제 동기화 실패:", err);
  }
}

async function syncUpdateQuantityBackend(sessionId: string, cartItemId: string, quantity: number) {
  try {
    await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
  } catch (err) {
    console.warn("BE 수량 변경 동기화 실패:", err);
  }
}


interface CartStore {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
  addItem: (item: CartItem, sessionId?: string) => void;
  removeItem: (cartItemId: string, sessionId?: string) => void;
  updateQuantity: (cartItemId: string, delta: number, sessionId?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalPrice: 0,
  itemCount: 0,

  addItem: (newItem, sessionId) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) => item.cartItemId === newItem.cartItemId
      );

      let updatedItems;
      if (existingItemIndex !== -1) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          subtotal: updatedItems[existingItemIndex].subtotal + newItem.subtotal,
        };
      } else {
        updatedItems = [...state.items, newItem];
      }

      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: updatedItems, totalPrice: newTotalPrice, itemCount: newItemCount };
    });

    // BE 동기화 (비동기, 실패해도 FE는 정상 동작)
    if (sessionId) {
      syncAddToBackend(sessionId, newItem);
    }
  },

  updateQuantity: (cartItemId, delta, sessionId) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (existingItemIndex === -1) return state;

      const item = state.items[existingItemIndex];
      const newQuantity = item.quantity + delta;

      let updatedItems;
      if (newQuantity <= 0) {
        updatedItems = state.items.filter((i) => i.cartItemId !== cartItemId);
        // BE에서도 삭제
        if (sessionId) syncRemoveFromBackend(sessionId, cartItemId);
      } else {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...item,
          quantity: newQuantity,
          subtotal: item.unitPrice * newQuantity,
        };
        // BE에 수량 변경
        if (sessionId) syncUpdateQuantityBackend(sessionId, cartItemId, newQuantity);
      }

      const newTotalPrice = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      const newItemCount = updatedItems.reduce((sum, i) => sum + i.quantity, 0);

      return { items: updatedItems, totalPrice: newTotalPrice, itemCount: newItemCount };
    });
  },

  removeItem: (cartItemId, sessionId) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.cartItemId !== cartItemId);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: updatedItems, totalPrice: newTotalPrice, itemCount: newItemCount };
    });

    // BE 동기화
    if (sessionId) {
      syncRemoveFromBackend(sessionId, cartItemId);
    }
  },

  clearCart: () => set({ items: [], totalPrice: 0, itemCount: 0 }),
}));
