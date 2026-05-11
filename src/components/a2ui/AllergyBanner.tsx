"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export interface AllergyBannerProps {
  allergens: string[];
  message: string;
  filteredCount: number;
}

export const AllergyBanner = (props: AllergyBannerProps) => {
  const { allergens, message, filteredCount } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
    >
      <ShieldCheck size={24} className="text-green-600 shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-green-800">{message}</p>
        <div className="flex items-center gap-2 mt-1">
          <AlertTriangle size={14} className="text-orange-500" />
          <span className="text-sm text-slate-600">
            제외 알레르기: {allergens.join(", ")}
          </span>
          <span className="text-sm text-slate-400">
            ({filteredCount}개 메뉴 제외)
          </span>
        </div>
      </div>
    </motion.div>
  );
};