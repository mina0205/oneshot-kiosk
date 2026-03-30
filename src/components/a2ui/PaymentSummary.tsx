"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Store, ShoppingBag, Tag } from "lucide-react";

export interface PaymentSummaryProps {
  items: {
    name: string;
    quantity: number;
    subtotal: number;
    isSet?: boolean;
    selectedSide?: string;
    selectedDrink?: string;
  }[];
  totalPrice: number;
  discount: number;
  finalPrice: number;
  orderType: "dineIn" | "takeOut";
}

export const PaymentSummary = (props: PaymentSummaryProps) => {
  const { items, totalPrice, discount, finalPrice, orderType } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-5">
        <CreditCard size={22} className="text-orange-500" />
        <h3 className="text-xl font-bold text-slate-800">결제 확인</h3>
      </div>

      {/* 주문 타입 */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl">
        {orderType === "dineIn" ? (
          <Store size={16} className="text-blue-500" />
        ) : (
          <ShoppingBag size={16} className="text-green-500" />
        )}
        <span className="text-sm font-medium text-slate-600">
          {orderType === "dineIn" ? "매장 식사" : "포장 주문"}
        </span>
      </div>

      {/* 주문 항목 */}
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-start py-3 border-b border-slate-100 last:border-none"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{item.name}</span>
                <span className="text-sm text-slate-400">x{item.quantity}</span>
              </div>
              {item.isSet && (item.selectedSide || item.selectedDrink) && (
                <p className="text-xs text-slate-400 mt-1">
                  {[item.selectedSide, item.selectedDrink]
                    .filter(Boolean)
                    .join(" + ")}
                </p>
              )}
            </div>
            <span className="font-bold text-slate-700 whitespace-nowrap">
              {item.subtotal.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>

      {/* 금액 요약 */}
      <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">주문 금액</span>
          <span className="font-medium text-slate-700">
            {totalPrice.toLocaleString()}원
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-red-500 flex items-center gap-1">
              <Tag size={12} /> 할인
            </span>
            <span className="font-medium text-red-500">
              -{discount.toLocaleString()}원
            </span>
          </div>
        )}

        <div className="border-t border-slate-200 my-1" />

        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-800 text-lg">최종 결제</span>
          <span className="text-2xl font-black text-orange-600">
            {finalPrice.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 결제 버튼 */}
      <button
        onClick={() => alert("결제가 완료되었습니다!")}
        className="w-full mt-5 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
      >
        <CreditCard size={20} />
        결제하기
      </button>
    </motion.div>
  );
};
