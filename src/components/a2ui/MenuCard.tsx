"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, ShoppingBag } from 'lucide-react';
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
}

export const MenuCard = (menu: MenuCardProps) => {
  const sessionId = useSessionStore((s) => s.sessionId);
  const addItem = useCartStore((s) => s.addItem);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const handleAddToCart = () => {
    addItem(
      {
        cartItemId: `${menu.menuId}-single`,
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
      className={`bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden ${
        menu.soldOut ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* 뱃지 */}
      <div className="absolute top-6 left-6 flex gap-1 z-10">
        {menu.isBestSeller && (
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            BEST
          </span>
        )}
        {menu.isNew && (
          <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            NEW
          </span>
        )}
        {menu.soldOut && (
          <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            품절
          </span>
        )}
      </div>

      {/* 프로모션 배너 */}
      {menu.promotion && (
        <div className="absolute top-6 right-6 z-10">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {menu.promotion.title}
          </span>
        </div>
      )}

      {/* 이미지 */}
      <div className="w-full h-40 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">
          [이미지: {menu.name}]
        </div>
      </div>

      {/* 메뉴 정보 */}
      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{menu.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1 leading-snug">
          {menu.description}
        </p>
      </div>

      {/* 알레르기 태그 */}
      {menu.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {menu.allergens.map((a) => (
            <span
              key={a}
              className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-medium text-orange-600"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {/* 가격 & 버튼 */}
      <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-medium">
            <Flame size={12} className="text-orange-400" /> {menu.calories} kcal
          </span>

          {menu.promotion ? (
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-400 line-through">
                {menu.promotion.originalPrice.toLocaleString()}원
              </span>
              <span className="text-2xl font-black text-red-600">
                {menu.promotion.discountedPrice.toLocaleString()}원
              </span>
            </div>
          ) : (
            <span className="text-2xl font-black text-orange-600">
              {menu.price.toLocaleString()}원
            </span>
          )}

          {menu.setPrice && (
            <span className="text-xs text-slate-400 mt-0.5">
              세트 {menu.setPrice.toLocaleString()}원
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {menu.setPrice && !menu.soldOut && (
            <button
              onClick={handleSelectSet}
              className="border border-slate-900 text-slate-900 p-3 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
              title="세트 주문"
            >
              <ShoppingBag size={20} />
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={menu.soldOut}
            className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 transition-all shadow-md"
            title="단품 담기"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
