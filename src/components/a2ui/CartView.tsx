// [Cell 2]: src/components/a2ui/CartView.tsx
// 장바구니에 담긴 메뉴 목록과 총 결제 금액, 주문하기 버튼을 보여주는 UI입니다.
// [Cell 2]: src/components/a2ui/CartView.tsx

"use client";

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react'; // Minus, Plus 아이콘 추가
import { useCartStore } from '@/store/cartStore';

export const CartView = () => {
  // 🚀 updateQuantity 함수를 스토어에서 가져옵니다.
  const { items, totalPrice, itemCount, removeItem, updateQuantity } = useCartStore();

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
            {items.map((item) => (
              <li key={item.cartItemId} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
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
                    {item.subtotal.toLocaleString()}원
                  </span>
                </div>
                
                {/* 🚀 수량 조절 및 삭제 버튼 영역 */}
                <div className="flex flex-col items-end gap-3">
                  {/* 단번에 삭제하고 싶을 때 쓰는 작은 휴지통 버튼 (옵션) */}
                  <button onClick={() => removeItem(item.cartItemId)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  
                  {/* 수량 조절 버튼 [ - | 1 | + ] */}
                  <div className="flex items-center gap-3 bg-slate-100 rounded-full px-2 py-1 shadow-inner">
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, -1)} 
                      className="p-1.5 rounded-full bg-white text-slate-600 hover:text-orange-600 shadow-sm transition-colors"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="text-sm font-black w-4 text-center text-slate-800">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, 1)} 
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
            {totalPrice.toLocaleString()}원
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