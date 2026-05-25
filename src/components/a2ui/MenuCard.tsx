// [Cell 1]: src/components/a2ui/MenuCard.tsx (세트 버튼 고대비 시인성 강화)

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, ShoppingBag, Flame } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSessionStore } from "@/store/sessionStore";
import { useChatStore } from "@/store/chatStore";
import { MenuItem } from "@/types/kiosk";
import { useToastStore } from "@/store/toastStore";
import { useUIStore } from "@/store/uiStore";

interface Promotion {
  title: string;
  originalPrice: number;
  discountedPrice: number;
}

export interface MenuCardProps extends MenuItem {
  promotion?: Promotion;
  imageUrl?: string;
}

export const MenuCard = (menu: MenuCardProps) => {
  const sessionId = useSessionStore((s) => s.sessionId);
  const addItem = useCartStore((s) => s.addItem);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const showToast = useToastStore((s) => s.showToast);

  const fontSize = useUIStore((s) => s.fontSize);
  const isLarge = fontSize === "large";
  
  const isHighContrast = useUIStore((s) => s.isHighContrast);

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
      sessionId,
    );
    showToast(`${menu.name}을(를) 장바구니에 담았습니다.`);
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
      className={`rounded-2xl p-3 shadow-sm flex flex-col hover:shadow-md transition-all relative overflow-hidden ${
        menu.soldOut ? "opacity-50 pointer-events-none grayscale" : ""
      } ${
        isHighContrast 
          ? "bg-black border-2 border-yellow-400" 
          : "bg-white border border-slate-100"
      }`}
    >
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {menu.isBestSeller && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit">
            BEST
          </span>
        )}
        {menu.isNew && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit">
            NEW
          </span>
        )}
      </div>

      <div className={`w-full h-24 sm:h-28 flex items-center justify-center mb-2 overflow-hidden rounded-xl ${isHighContrast ? "bg-white/10" : "bg-transparent"}`}>
        {menu.imageUrl || menu.image ? (
          <img
            src={menu.imageUrl || menu.image}
            alt={menu.name}
            className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
            이미지 없음
          </div>
        )}
      </div>

      <div className="min-h-[2.5rem] sm:min-h-[2.75rem] w-full flex items-center justify-center mb-1 px-1">
        <h3 className={`font-bold tracking-tight text-center break-keep break-words line-clamp-2 transition-all duration-200 ${
          isLarge ? "text-lg sm:text-xl leading-tight" : "text-sm sm:text-base leading-snug"
        } ${isHighContrast ? "text-yellow-400" : "text-slate-800"}`}>
          {menu.name}
        </h3>
      </div>

      <div className="flex flex-col items-center gap-1 mb-3 min-h-[36px]">
        {menu.calories != null && (
          <span className={`flex items-center gap-0.5 font-medium ${isLarge ? "text-xs" : "text-[10px]"} ${isHighContrast ? "text-slate-300" : "text-slate-500"}`}>
            <Flame size={isLarge ? 12 : 10} className="text-orange-400" /> {menu.calories} kcal
          </span>
        )}
        {menu.allergens && menu.allergens.length > 0 && (
          <div className="flex flex-wrap justify-center gap-0.5 px-1">
            {menu.allergens.map((a) => (
              <span
                key={a}
                className={`px-1 py-[1px] rounded-sm border ${isLarge ? "text-[10px]" : "text-[9px]"} ${
                  isHighContrast ? "bg-black text-yellow-400 border-yellow-400" : "bg-orange-50 text-orange-600 border-orange-100"
                }`}
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-3 mt-auto">
        <div className="flex justify-center items-center gap-1.5">
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm shrink-0 ${isHighContrast ? "bg-yellow-400 text-black" : "bg-orange-100 text-orange-600"}`}>
            단
          </span>
          <span className={`font-black transition-all duration-200 ${
            isLarge ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
          } ${isHighContrast ? "text-white" : "text-slate-800"}`}>
            {menu.price.toLocaleString()}원
          </span>
        </div>
        {menu.setPrice ? (
          <div className="flex justify-center items-center gap-1.5">
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm shrink-0 ${isHighContrast ? "bg-white text-black" : "bg-yellow-100 text-yellow-700"}`}>
              세
            </span>
            <span className={`font-black transition-all duration-200 ${
              isLarge ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
            } ${isHighContrast ? "text-white" : "text-slate-800"}`}>
              {menu.setPrice.toLocaleString()}원
            </span>
          </div>
        ) : (
          <div className="h-[22px] sm:h-[24px]"></div>
        )}
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={handleAddToCart}
          disabled={menu.soldOut}
          className={`flex-1 py-2 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm ${
            isLarge ? "text-sm px-1" : "text-xs"
          } ${
            isHighContrast 
              ? "bg-yellow-400 text-black hover:bg-yellow-300 disabled:bg-slate-700 disabled:text-slate-500" 
              : "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300"
          }`}
        >
          <Plus size={isLarge ? 16 : 14} /> 담기
        </button>
        {menu.setPrice && !menu.soldOut && (
          <button
            onClick={handleSelectSet}
            // 🚀 핵심 수정: 고대비 모드일 때 세트 버튼을 눈에 띄는 '흰 바탕 + 검은 글씨'로 변경
            className={`flex-1 border-2 py-2 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-1 ${
              isLarge ? "text-sm px-1" : "text-xs"
            } ${
              isHighContrast
                ? "bg-white text-black border-white hover:bg-gray-200"
                : "border-slate-900 text-slate-900 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag size={isLarge ? 16 : 14} /> 세트
          </button>
        )}
      </div>
    </motion.div>
  );
};