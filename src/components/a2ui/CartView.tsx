"use client";

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';

interface CartProps {
  items?: any[];
  totalPrice?: number;
  totalCalories?: number;
  itemCount?: number;
}

export const CartView = (props: CartProps) => {
  const store = useCartStore();
  const sessionId = useSessionStore((s) => s.sessionId);

  const hasBEData = props.items && props.items.length > 0;

  const items = hasBEData ? props.items! : store.items;
  const totalPrice = hasBEData ? props.totalPrice! : store.totalPrice;
  const itemCount = hasBEData ? props.itemCount! : store.itemCount;

  // BE 장바구니 항목 삭제
  const handleBERemove = async (cartItemId: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
        method: "DELETE",
      });
      // 삭제 후 props에서 해당 항목 제거 (화면 즉시 반영)
      if (props.items) {
        const idx = props.items.findIndex((i: any) => i.cartItemId === cartItemId);
        if (idx !== -1) props.items.splice(idx, 1);
      }
      // 강제 리렌더를 위해 Zustand도 트리거
      store.clearCart();
    } catch (err) {
      console.warn("BE 장바구니 삭제 실패:", err);
    }
  };

  // BE 장바구니 수량 변경
  const handleBEUpdateQuantity = async (cartItemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleBERemove(cartItemId);
      return;
    }
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      // 화면 즉시 반영
      if (props.items) {
        const item = props.items.find((i: any) => i.cartItemId === cartItemId);
        if (item) {
          item.quantity = newQty;
          item.subtotal = item.unitPrice * newQty;
        }
      }
      store.clearCart(); // 리렌더 트리거
    } catch (err) {
      console.warn("BE 수량 변경 실패:", err);
    }
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 w-full flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">장바구니</h3>
        <span className="text-sm text-orange-600 font-bold">총 {itemCount}개 담김</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium py-12">
            아직 담은 메뉴가 없습니다.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item: any) => (
              <li 
                key={item.cartItemId} 
                className={`flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border ${
                  item.isModified ? 'border-orange-400 bg-orange-50' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-col flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    {item.isModified && (
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">변경됨</span>
                    )}
                  </div>
                  
                  {item.isSet && (
                    <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                      <span>- {item.selectedSide || '사이드 미선택'}</span>
                      <span>- {item.selectedDrink || '음료 미선택'} {item.drinkSize === 'L' ? '(L)' : '(R)'}</span>
                    </div>
                  )}
                  
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="text-xs text-orange-500 mt-1">
                      + {item.toppings.join(', ')}
                    </div>
                  )}

                  <span className="text-sm font-bold text-slate-700 mt-2">
                    {(item.subtotal || 0).toLocaleString()}원
                  </span>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  {/* 삭제 버튼 — BE, FE 모두 표시 */}
                  <button 
                    onClick={() => hasBEData 
                      ? handleBERemove(item.cartItemId) 
                      : store.removeItem(item.cartItemId, sessionId)
                    } 
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  {/* 수량 조절 버튼 — BE, FE 모두 표시 */}
                  <div className="flex items-center gap-3 bg-slate-100 rounded-full px-2 py-1 shadow-inner">
                    <button 
                      onClick={() => hasBEData
                        ? handleBEUpdateQuantity(item.cartItemId, item.quantity, -1)
                        : store.updateQuantity(item.cartItemId, -1, sessionId)
                      }
                      className="p-1.5 rounded-full bg-white text-slate-600 hover:text-orange-600 shadow-sm transition-colors"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="text-sm font-black w-4 text-center text-slate-800">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => hasBEData
                        ? handleBEUpdateQuantity(item.cartItemId, item.quantity, 1)
                        : store.updateQuantity(item.cartItemId, 1, sessionId)
                      }
                      className="p-1.5 rounded-full bg-white text-slate-600 hover:text-orange-600 shadow-sm transition-colors"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-600 font-bold">총 결제 금액</span>
          <span className="text-2xl font-black text-orange-600">
            {(totalPrice || 0).toLocaleString()}원
          </span>
        </div>
        
        <button 
          disabled={items.length === 0}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          주문하기
        </button>
      </div>
    </div>
  );
};
