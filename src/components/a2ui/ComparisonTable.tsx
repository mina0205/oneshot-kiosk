"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Scale } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface ComparisonMenu {
  menuId: string;
  name: string;
  image: string;
  price: number;
  calories: number;
  protein: number;
  sodium: number;
  sugar: number;
  saturatedFat: number;
  allergens: string[];
}

export interface ComparisonTableProps {
  menus: ComparisonMenu[];
}

export const ComparisonTable = (props: ComparisonTableProps) => {
  const { menus } = props;
  const addItem = useCartStore((state) => state.addItem);

  const handleSelect = (menu: ComparisonMenu) => {
    addItem({
      cartItemId: `${menu.menuId}-single`,
      menuId: menu.menuId,
      name: menu.name,
      isSet: false,
      quantity: 1,
      unitPrice: menu.price,
      subtotal: menu.price,
    });
  };

  // 비교 항목별 더 나은 쪽 판단 (낮을수록 좋은 항목)
  const getBetter = (field: "price" | "calories" | "sodium" | "sugar" | "saturatedFat") => {
    if (menus.length !== 2) return null;
    if (menus[0][field] === menus[1][field]) return null;
    return menus[0][field] < menus[1][field] ? 0 : 1;
  };

  // 높을수록 좋은 항목
  const getHigherBetter = (field: "protein") => {
    if (menus.length !== 2) return null;
    if (menus[0][field] === menus[1][field]) return null;
    return menus[0][field] > menus[1][field] ? 0 : 1;
  };

  const rows: { label: string; field: string; unit: string; lowerBetter: boolean }[] = [
    { label: "가격", field: "price", unit: "원", lowerBetter: true },
    { label: "칼로리", field: "calories", unit: "kcal", lowerBetter: true },
    { label: "단백질", field: "protein", unit: "g", lowerBetter: false },
    { label: "나트륨", field: "sodium", unit: "mg", lowerBetter: true },
    { label: "당류", field: "sugar", unit: "g", lowerBetter: true },
    { label: "포화지방", field: "saturatedFat", unit: "g", lowerBetter: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-2xl mx-auto"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-5">
        <Scale size={22} className="text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800">메뉴 비교</h3>
      </div>

      {/* 메뉴 이름 헤더 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div />
        {menus.map((menu) => (
          <div key={menu.menuId} className="text-center">
            <div className="w-full h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm mb-2">
              [이미지: {menu.name}]
            </div>
            <h4 className="font-bold text-slate-800">{menu.name}</h4>
          </div>
        ))}
      </div>

      {/* 비교 행 */}
      <div className="flex flex-col">
        {rows.map((row) => {
          const betterIdx = row.lowerBetter
            ? getBetter(row.field as any)
            : getHigherBetter(row.field as any);

          return (
            <div
              key={row.field}
              className="grid grid-cols-3 gap-4 py-3 border-b border-slate-100 last:border-none items-center"
            >
              <span className="text-sm font-medium text-slate-500">
                {row.label}
              </span>
              {menus.map((menu, idx) => {
                const value = (menu as any)[row.field];
                const isBetter = betterIdx === idx;

                return (
                  <div key={menu.menuId} className="text-center">
                    <span
                      className={`text-lg font-bold ${
                        isBetter ? "text-green-600" : "text-slate-700"
                      }`}
                    >
                      {row.field === "price"
                        ? value.toLocaleString()
                        : value}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        {row.unit}
                      </span>
                    </span>
                    {isBetter && (
                      <span className="ml-1 text-xs text-green-500 font-medium">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 알레르기 비교 */}
      <div className="grid grid-cols-3 gap-4 py-3 items-start">
        <span className="text-sm font-medium text-slate-500">알레르기</span>
        {menus.map((menu) => (
          <div key={menu.menuId} className="flex flex-wrap gap-1 justify-center">
            {menu.allergens.map((a) => (
              <span
                key={a}
                className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-medium text-orange-600"
              >
                {a}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* 선택 버튼 */}
      <div className="grid grid-cols-3 gap-4 mt-5">
        <div />
        {menus.map((menu) => (
          <button
            key={menu.menuId}
            onClick={() => handleSelect(menu)}
            className="bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
          >
            선택 <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </motion.div>
  );
};
