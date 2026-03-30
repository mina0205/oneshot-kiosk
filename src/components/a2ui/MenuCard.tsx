// [Cell 1]: src/components/a2ui/MenuCard.tsx

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, Info } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { MenuItem } from '@/types/kiosk'; // 우리가 만든 고급 타입 불러오기

// MenuItem 전체를 Props로 바로 사용합니다.
export const MenuCard = (menu: MenuItem) => {
  const addItem = useCartStore((state) => state.addItem);

  // 장바구니 담기 (새로운 CartItem 스키마에 맞춤!)
  const handleAddToCart = () => {
    addItem({
      cartItemId: `${menu.menuId}-single`, // 단품은 뒤에 -single을 붙여서 구분
      menuId: menu.menuId,
      name: menu.name,
      isSet: false,
      quantity: 1,
      unitPrice: menu.price,
      subtotal: menu.price,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* 품절/신제품/베스트 뱃지 표시 */}
      <div className="absolute top-6 left-6 flex gap-1 z-10">
        {menu.isBestSeller && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">BEST</span>}
        {menu.isNew && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">NEW</span>}
      </div>

      <div className="w-full h-40 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden relative">
        {/* 이미지가 없을 경우 대비 (현재는 경로만 있으므로 나중에 실제 이미지를 public/images 폴더에 넣어야 보입니다) */}
        {menu.image ? (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">
            [이미지 영역: {menu.name}]
          </div>
        ) : null}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{menu.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1 leading-snug">
          {menu.description}
        </p>
      </div>

      <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-medium">
            <Flame size={12} className="text-orange-400" /> {menu.calories} kcal
          </span>
          <span className="text-2xl font-black text-orange-600">
            {menu.price.toLocaleString()}원
          </span>
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={menu.soldOut}
          className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 transition-all shadow-md"
        >
          <Plus size={24} />
        </button>
      </div>
    </motion.div>
  );
};