"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface ToppingItem {
  name: string;
  isOriginal: boolean;
  isAdded: boolean;
  isRemoved: boolean;
  price: number;
}

export interface CustomBuilderProps {
  baseMenu: {
    menuId: string;
    name: string;
    image: string;
  };
  currentToppings: ToppingItem[];
  additionalPrice: number;
}

export const CustomBuilder = (props: CustomBuilderProps) => {
  const { baseMenu } = props;
  const addItem = useCartStore((state) => state.addItem);
  const [toppings, setToppings] = useState<ToppingItem[]>(props.currentToppings);

  const additionalPrice = toppings.reduce((sum, t) => {
    if (t.isAdded && !t.isOriginal) return sum + t.price;
    return sum;
  }, 0);

  const toggleTopping = (index: number) => {
    setToppings((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        if (t.isOriginal) {
          return { ...t, isRemoved: !t.isRemoved };
        } else {
          return { ...t, isAdded: !t.isAdded };
        }
      })
    );
  };

  const handleAddToCart = () => {
    const activeNames = toppings
      .filter((t) => (t.isOriginal && !t.isRemoved) || t.isAdded)
      .map((t) => t.name);

    addItem({
      cartItemId: `${baseMenu.menuId}-custom-${Date.now()}`,
      menuId: baseMenu.menuId,
      name: `${baseMenu.name} (커스텀)`,
      isSet: false,
      quantity: 1,
      unitPrice: additionalPrice,
      subtotal: additionalPrice,
      toppings: activeNames,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md mx-auto"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <Wrench size={22} className="text-amber-500" />
        <h3 className="text-xl font-bold text-slate-800">나만의 버거 만들기</h3>
      </div>

      {/* 베이스 메뉴 */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-5 flex items-center gap-3">
        <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs shrink-0">
          [이미지]
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{baseMenu.name}</h4>
          <p className="text-sm text-slate-400">베이스 메뉴</p>
        </div>
      </div>

      {/* 토핑 리스트 */}
      <div className="flex flex-col gap-2 mb-5">
        <p className="text-sm font-medium text-slate-500 mb-1">재료 구성</p>
        {toppings.map((topping, idx) => {
          const isActive = topping.isOriginal ? !topping.isRemoved : topping.isAdded;

          return (
            <button
              key={idx}
              onClick={() => toggleTopping(idx)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive ? "bg-amber-500" : "bg-slate-300"
                  }`}
                >
                  {isActive ? (
                    <Plus size={12} className="text-white" />
                  ) : (
                    <Minus size={12} className="text-white" />
                  )}
                </div>
                <span
                  className={`font-medium ${
                    isActive ? "text-slate-800" : "text-slate-400 line-through"
                  }`}
                >
                  {topping.name}
                </span>
                {topping.isOriginal && (
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                    기본
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-500">
                {topping.price > 0
                  ? `+${topping.price.toLocaleString()}원`
                  : "무료"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 추가 금액 + 담기 */}
      <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-4">
        <span className="font-medium text-slate-600">추가 금액</span>
        <span className="text-xl font-black text-orange-600">
          +{additionalPrice.toLocaleString()}원
        </span>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
      >
        <ShoppingBag size={20} /> 장바구니에 담기
      </button>
    </motion.div>
  );
};
