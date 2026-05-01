"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Wallet, ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface ComboItem {
  name: string;
  price: number;
}

interface Combo {
  comboId: string;
  label: string;
  items: ComboItem[];
  totalPrice: number;
  remaining: number;
}

export interface ComboRecommendationProps {
  budget: number;
  headcount: number;
  combos: Combo[];
}

export const ComboRecommendation = (props: ComboRecommendationProps) => {
  const { budget, headcount, combos } = props;
  const addItem = useCartStore((state) => state.addItem);

  const handleSelectCombo = (combo: Combo) => {
    combo.items.forEach((item, idx) => {
      addItem({
        cartItemId: `combo-${combo.comboId}-${idx}-${Date.now()}`,
        menuId: `combo-${combo.comboId}-${idx}`,
        name: item.name,
        isSet: false,
        quantity: 1,
        unitPrice: item.price,
        subtotal: item.price,
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-2xl mx-auto"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <Wallet size={22} className="text-emerald-500" />
        <h3 className="text-xl font-bold text-slate-800">예산 맞춤 추천</h3>
      </div>
      <div className="flex items-center gap-4 mb-5 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={14} /> {headcount}명
        </span>
        <span className="flex items-center gap-1">
          <Wallet size={14} /> 예산 {budget.toLocaleString()}원
        </span>
      </div>

      {/* 조합 카드 */}
      <div className="flex flex-col gap-4">
        {combos.map((combo, idx) => (
          <motion.div
            key={combo.comboId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border-2 border-slate-100 rounded-2xl p-5 hover:border-emerald-300 transition-colors"
          >
            {/* 조합 라벨 */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-lg">{combo.label}</h4>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                잔액 {combo.remaining.toLocaleString()}원
              </span>
            </div>

            {/* 구성 항목 */}
            <div className="flex flex-col gap-2 mb-4">
              {combo.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex justify-between items-center text-sm py-1"
                >
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-medium text-slate-700">
                    {item.price.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>

            {/* 합계 + 선택 버튼 */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span className="text-sm text-slate-400">합계</span>
                <span className="ml-2 text-xl font-black text-orange-600">
                  {combo.totalPrice.toLocaleString()}원
                </span>
              </div>
              <button
                onClick={() => handleSelectCombo(combo)}
                className="bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center gap-1"
              >
                <ShoppingBag size={16} /> 이 조합 담기
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
