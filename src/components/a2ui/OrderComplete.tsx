"use client";

import React from "react";
import { motion } from "framer-motion";
import { CircleCheckBig, Store, ShoppingBag, Clock } from "lucide-react";

export interface OrderCompleteProps {
  orderId: string;
  orderNumber: number;
  estimatedTime: number;
  totalPrice?: number;      // ← 추가
  discount?: number;      
  finalPrice: number;
  orderType: "dineIn" | "takeOut";
}

export const OrderComplete = (props: OrderCompleteProps) => {
  const { orderId, orderNumber, estimatedTime, totalPrice, discount,finalPrice, orderType } = props;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex justify-center"
    >
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200 w-full max-w-md text-center">
        {/* 체크 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CircleCheckBig size={40} className="text-green-600" />
        </motion.div>

        <h2 className="text-2xl font-black text-slate-900 mb-1">
          주문이 완료되었습니다!
        </h2>
        <p className="text-sm text-slate-400 mb-6">주문번호</p>

        {/* 주문번호 */}
        <div className="bg-slate-900 text-white rounded-2xl py-6 px-4 mb-6">
          <span className="text-6xl font-black">{orderNumber}</span>
        </div>

        {/* 주문 정보 */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 text-left mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">주문 번호</span>
            <span className="font-medium text-slate-700">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">주문 유형</span>
            <span className="font-medium text-slate-700 flex items-center gap-1">
              {orderType === "dineIn" ? (
                <>
                  <Store size={14} /> 매장 식사
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> 포장
                </>
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">예상 소요시간</span>
            <span className="font-medium text-orange-600 flex items-center gap-1">
              <Clock size={14} /> 약 {estimatedTime}분
            </span>
          </div>
          <div className="border-t border-slate-200 my-1" />
              {discount != null && discount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">주문 금액</span>
                    <span className="font-medium text-slate-700">
                      {(totalPrice ?? finalPrice + discount).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">프로모션/쿠폰 할인</span>
                    <span className="font-medium text-red-500">
                      -{discount.toLocaleString()}원
                    </span>
                  </div>
                </>
              )}
          <div className="flex justify-between">
            <span className="font-bold text-slate-800">결제 금액</span>
            <span className="text-xl font-black text-orange-600">
              {finalPrice.toLocaleString()}원
            </span>
          </div>

  
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          처음으로 돌아가기
        </button>
      </div>
    </motion.div>
  );
};