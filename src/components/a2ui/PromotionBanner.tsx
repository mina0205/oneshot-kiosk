"use client";

import React from "react";
import { motion } from "framer-motion";
import { Megaphone, Percent, Tag } from "lucide-react";

interface Promotion {
  title: string;
  description: string;
  discountType: "rate" | "amount";
  discountValue: number;
  applicableCount: number;
}

export interface PromotionBannerProps {
  promotions: Promotion[];
}

export const PromotionBanner = (props: PromotionBannerProps) => {
  const { promotions } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={22} className="text-orange-500" />
        <h3 className="text-lg font-bold text-slate-800">진행 중인 프로모션</h3>
      </div>

      <div className="flex flex-col gap-3">
        {promotions.map((promo, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                {promo.discountType === "rate" ? (
                  <Percent size={18} className="text-orange-600" />
                ) : (
                  <Tag size={18} className="text-orange-600" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{promo.title}</h4>
                <p className="text-sm text-slate-500">{promo.description}</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="text-xl font-black text-red-500">
                {promo.discountType === "rate"
                  ? `${Math.round(promo.discountValue * 100)}%`
                  : `${promo.discountValue.toLocaleString()}원`}
              </span>
              <p className="text-xs text-slate-400">
                적용 메뉴 {promo.applicableCount}개
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
