"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Check, Clock } from "lucide-react";
import { useUIStore } from '@/store/uiStore';

export interface Coupon {
  couponId: string;
  title: string;
  discountType: "rate" | "amount";
  discountValue: number;
  minOrderPrice: number;
  expiresAt: string;
  isApplicable: boolean;
}

export interface CouponSelectorProps {
  coupons: Coupon[];
  selectedCouponId?: string;
}

export const CouponSelector = (props: CouponSelectorProps) => {
  const { coupons, selectedCouponId } = props;
  const [selected, setSelected] = useState<string | null>(selectedCouponId ?? null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const handleSelect = (coupon: Coupon) => {
  if (!coupon.isApplicable) return;
  const isDeselecting = selected === coupon.couponId;
  const newId = isDeselecting ? null : coupon.couponId;
  setSelected(newId);
  useUIStore.getState().setSelectedCouponId(newId);
  useUIStore.getState().setSelectedCoupon(isDeselecting ? null : coupon);  // 추가
};
   
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md mx-auto"
    >
      <div className="flex items-center gap-2 mb-5">
        <Ticket size={22} className="text-purple-500" />
        <h3 className="text-xl font-bold text-slate-800">쿠폰 선택</h3>
      </div>

      <div className="flex flex-col gap-3">
        {coupons.map((coupon, idx) => {
          const isSelected = selected === coupon.couponId;
          const isDisabled = !coupon.isApplicable;

          return (
            <motion.button
              key={coupon.couponId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelect(coupon)}
              disabled={isDisabled}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-50"
                  : isDisabled
                  ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              {/* 선택 체크 */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-purple-500" : "bg-purple-100"
                  }`}
                >
                  <span
                    className={`text-lg font-black ${
                      isSelected ? "text-white" : "text-purple-600"
                    }`}
                  >
                    {coupon.discountType === "rate"
                      ? `${coupon.discountValue}%`
                      : `${Math.floor(coupon.discountValue / 1000)}천`}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{coupon.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>최소 주문 {coupon.minOrderPrice.toLocaleString()}원</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} /> ~{formatDate(coupon.expiresAt)}
                    </span>
                  </p>
                  {isDisabled && (
                    <p className="text-xs text-red-400 mt-1">
                      현재 주문에 적용할 수 없습니다
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 선택 결과 */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-purple-50 rounded-xl text-center"
        >
          <span className="text-sm font-medium text-purple-700">
            쿠폰이 적용되었습니다 ✓
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
