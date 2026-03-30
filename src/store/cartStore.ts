// [Cell 3]: src/store/cartStore.ts
// 고도화된 데이터 스키마를 적용한 전역 장바구니 상태 관리
// [Cell 1]: src/store/cartStore.ts

import { create } from 'zustand';
import { CartItem } from '../types/kiosk';

interface CartStore {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void; // 🚀 수량 조절 함수 추가
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalPrice: 0,
  itemCount: 0,

  addItem: (newItem) => set((state) => {
    const existingItemIndex = state.items.findIndex(item => item.cartItemId === newItem.cartItemId);
    
    let updatedItems;
    if (existingItemIndex !== -1) {
      updatedItems = [...state.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        subtotal: updatedItems[existingItemIndex].subtotal + newItem.subtotal
      };
    } else {
      updatedItems = [...state.items, newItem];
    }

    const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: updatedItems, totalPrice: newTotalPrice, itemCount: newItemCount };
  }),

  // 🚀 새로 추가된 수량 조절 로직
  updateQuantity: (cartItemId, delta) => set((state) => {
    const existingItemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
    if (existingItemIndex === -1) return state;

    const item = state.items[existingItemIndex];
    const newQuantity = item.quantity + delta;

    let updatedItems;
    if (newQuantity <= 0) {
      // 수량이 0 이하가 되면 장바구니에서 아예 삭제
      updatedItems = state.items.filter(i => i.cartItemId !== cartItemId);
    } else {
      // 수량이 1 이상이면 수량과 합계 금액 업데이트
      updatedItems = [...state.items];
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: newQuantity,
        subtotal: item.unitPrice * newQuantity // 단가 * 새로운 수량
      };
    }

    const newTotalPrice = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const newItemCount = updatedItems.reduce((sum, i) => sum + i.quantity, 0);

    return { items: updatedItems, totalPrice: newTotalPrice, itemCount: newItemCount };
  }),

  removeItem: (cartItemId) => set((state) => {
    const updatedItems = state.items.filter(item => item.cartItemId !== cartItemId);
    const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return { items: updatedItems, totalPrice: newTotalPrice, itemCount: newItemCount };
  }),

  clearCart: () => set({ items: [], totalPrice: 0, itemCount: 0 }),
}));