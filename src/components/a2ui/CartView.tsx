// src/components/a2ui/CartView.tsx
// 백엔드(BE) 연동 및 주문 완료 화면 전환 로직이 포함된 최종 장바구니 컴포넌트입니다.

"use client";

import React, { useState } from 'react';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUIStore } from '@/store/uiStore';

interface CartProps {
  items?: any[];
  totalPrice?: number;
  totalCalories?: number;
  itemCount?: number;
}

export const CartView = (props: CartProps) => {
  const store = useCartStore();
  const sessionId = useSessionStore((s) => s.sessionId);
  const setOverrideMessages = useUIStore((s) => s.setOverrideMessages);
  
  const selectedCouponId = useUIStore((s) => s.selectedCouponId);
  const selectedCoupon = useUIStore((s) => s.selectedCoupon); // 추가

  const [isOrdering, setIsOrdering] = useState(false);

  const hasBEData = props.items && props.items.length > 0;

  const items = hasBEData ? props.items! : store.items;
  const totalPrice = hasBEData ? props.totalPrice! : store.totalPrice;
  const itemCount = hasBEData ? props.itemCount! : store.itemCount;

  // 쿠폰 할인 금액 계산 (백엔드 orders.py 로직과 동일)
  const couponDiscount = (() => {
    if (!selectedCoupon || !totalPrice) return 0;
    if (totalPrice < selectedCoupon.minOrderPrice) return 0;
    if (selectedCoupon.discountType === "amount") return selectedCoupon.discountValue;
    if (selectedCoupon.discountType === "rate") return Math.floor(totalPrice * selectedCoupon.discountValue);
    return 0;
  })();

  const finalPrice = (totalPrice || 0) - couponDiscount;

  // [기능] BE 장바구니 항목 삭제
  const handleBERemove = async (cartItemId: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${cartItemId}`, {
        method: "DELETE",
      });
      if (props.items) {
        const idx = props.items.findIndex((i: any) => i.cartItemId === cartItemId);
        if (idx !== -1) props.items.splice(idx, 1);
      }
      store.clearCart();
    } catch (err) {
      console.warn("BE 장바구니 삭제 실패:", err);
    }
  };

  // [기능] BE 장바구니 수량 변경
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
      if (props.items) {
        const item = props.items.find((i: any) => i.cartItemId === cartItemId);
        if (item) {
          item.quantity = newQty;
          item.subtotal = item.unitPrice * newQty;
        }
      }
      store.clearCart();
    } catch (err) {
      console.warn("BE 수량 변경 실패:", err);
    }
  };

  // [기능] 주문 확정 및 화면 전환
  const handleOrder = async () => {
    if (items.length === 0 || isOrdering) return;
    setIsOrdering(true);

    let orderResult: any = null;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const couponId = useUIStore.getState().selectedCouponId;

      const response = await fetch(`${API_BASE_URL}/orders/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: items, 
          totalPrice: totalPrice,
          couponId: couponId
        }),
      });

      if (response.ok) {
        orderResult = await response.json(); 
      } else {
        console.warn("BE 주문 응답 실패 (폴백 UI 실행)");
      }
    } catch (error) {
      console.error("주문 통신 에러 (서버 미연결):", error);
    } finally {
      store.clearCart();
      useUIStore.getState().setSelectedCouponId(null);
      useUIStore.getState().setSelectedCoupon(null); // 추가: 주문 후 쿠폰 객체도 초기화

      if (typeof setOverrideMessages === 'function') {
        setOverrideMessages([
          {
            id: `order-success-${Date.now()}`,
            type: 'OrderComplete',
            props: orderResult ? orderResult : { 
              orderNumber: Math.floor(Math.random() * 900) + 100,
              finalPrice: finalPrice,
              totalPrice: totalPrice
            }
          }
        ]);
      }
      
      setIsOrdering(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 w-full flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">장바구니</h3>
        <span className="text-sm text-orange-600 font-bold">총 {itemCount}개 담김</span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1">
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
                    <div className="text-xs text-purple-500 mt-1 flex flex-wrap gap-1">
                      {item.toppings.map((t: string) => (
                        <span key={t} className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          + {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-sm font-bold text-slate-700 mt-2">
                    {(item.subtotal || 0).toLocaleString()}원
                  </span>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <button 
                    onClick={() => hasBEData 
                      ? handleBERemove(item.cartItemId) 
                      : store.removeItem(item.cartItemId, sessionId)
                    } 
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  
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

      {/* 금액 및 주문 버튼 영역 */}
      <div className="mt-6 pt-4 border-t border-slate-200">

        {/* 쿠폰 적용 배너 */}
        {selectedCouponId && (
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-sm text-green-600 font-bold flex items-center gap-1">
              🎟️ 쿠폰 적용됨
              {couponDiscount > 0
                ? ` (-${couponDiscount.toLocaleString()}원)`
                : " (현재 금액 미달)"}
            </span>
            <button
              onClick={() => {
                useUIStore.getState().setSelectedCouponId(null);
                useUIStore.getState().setSelectedCoupon(null); // 추가: 쿠폰 객체도 함께 초기화
              }}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              해제
            </button>
          </div>
        )}

        {/* 금액 요약 */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">주문 금액</span>
            <span className="text-slate-700 font-medium">
              {(totalPrice || 0).toLocaleString()}원
            </span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 font-bold">쿠폰 할인</span>
              <span className="text-green-600 font-bold">
                -{couponDiscount.toLocaleString()}원
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-200 pt-2">
            <span className="text-slate-600 font-bold">최종 결제 금액</span>
            <span className="text-2xl font-black text-orange-600">
              {finalPrice.toLocaleString()}원
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleOrder}
          disabled={items.length === 0 || isOrdering}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center"
        >
          {isOrdering ? (
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span>처리 중...</span>
            </div>
          ) : "주문하기"}
        </button>
      </div>

    </div>
  );
};