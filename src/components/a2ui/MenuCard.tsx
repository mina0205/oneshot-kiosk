// [Cell 1]: src/components/a2ui/MenuCard.tsx

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Flame } from 'lucide-react'; // 🚀 Flame(칼로리 아이콘) 다시 추가
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from "@/store/sessionStore";
import { useChatStore } from "@/store/chatStore";
import { MenuItem } from '@/types/kiosk';

interface Promotion {
  title: string;
  originalPrice: number;
  discountedPrice: number;
}

export interface MenuCardProps extends MenuItem {
  promotion?: Promotion;
  imageUrl?: string; 
  image?: string;
}

export const MenuCard = (menu: MenuCardProps) => {
  const sessionId = useSessionStore((s) => s.sessionId);
  const addItem = useCartStore((s) => s.addItem);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const handleAddToCart = () => {
    addItem(
      {
        cartItemId: `${menu.menuId}-single-${Date.now()}`,
        menuId: menu.menuId,
        name: menu.name,
        isSet: false,
        quantity: 1,
        unitPrice: menu.price,
        subtotal: menu.price,
      },
      sessionId
    );
  };

  const handleSelectSet = () => {
    if (menu.soldOut || !menu.setPrice) return;
    if (sendMessage) {
      sendMessage(`${menu.name} 세트 주문할게`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden ${
        menu.soldOut ? "opacity-50 pointer-events-none grayscale" : ""
      }`}
    >
      {/* 뱃지 */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {menu.isBestSeller && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit">BEST</span>
        )}
        {menu.isNew && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit">NEW</span>
        )}
      </div>

      {/* 진짜 햄버거 이미지 영역 */}
      <div className="w-full h-24 sm:h-28 bg-transparent flex items-center justify-center mb-2 overflow-hidden">
        {menu.imageUrl || menu.image ? (
          <img 
            src={menu.imageUrl || menu.image} 
            alt={menu.name} 
            className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 text-xs rounded-xl">
            이미지 준비중
          </div>
        )}
      </div>

      {/* 메뉴 이름 */}
      <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate text-center mb-1">
        {menu.name}
      </h3>

      {/* 🚀 핵심 정보 복구: 칼로리 & 알레르기 (아주 작게 배치하여 공간 절약) */}
      <div className="flex flex-col items-center gap-1 mb-3 min-h-[36px]">
        {menu.calories && (
          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium">
            <Flame size={10} className="text-orange-400" /> {menu.calories} kcal
          </span>
        )}
        {menu.allergens && menu.allergens.length > 0 && (
          <div className="flex flex-wrap justify-center gap-0.5 px-1">
            {menu.allergens.map((a) => (
              <span key={a} className="text-[9px] bg-orange-50 text-orange-600 border border-orange-100 px-1 py-[1px] rounded-sm">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 가격 정보 (맘스터치 UI 스타일) */}
      <div className="flex flex-col gap-1.5 mb-3 mt-auto">
        <div className="flex justify-center items-center gap-1.5">
          <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-1.5 py-0.5 rounded-sm">단</span>
          <span className="text-sm sm:text-base font-black text-slate-800">
            {menu.price.toLocaleString()}원
          </span>
        </div>
        {menu.setPrice ? (
          <div className="flex justify-center items-center gap-1.5">
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded-sm">세</span>
            <span className="text-sm sm:text-base font-black text-slate-800">
              {menu.setPrice.toLocaleString()}원
            </span>
          </div>
        ) : (
          <div className="h-[22px] sm:h-[24px]"></div> 
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-1.5">
        <button
          onClick={handleAddToCart}
          disabled={menu.soldOut}
          className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 transition-all flex items-center justify-center gap-1 shadow-sm"
        >
          <Plus size={14} /> 담기
        </button>
        {menu.setPrice && !menu.soldOut && (
          <button
            onClick={handleSelectSet}
            className="flex-1 border-2 border-slate-900 text-slate-900 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <ShoppingBag size={14} /> 세트
          </button>
        )}
      </div>
    </motion.div>
  );
};