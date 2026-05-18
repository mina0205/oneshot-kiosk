"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export const Toast = () => {
  const message = useToastStore((s) => s.message);

  if (!message) return null;

  return (
    <div className="absolute left-1/2 top-20 z-[9999] -translate-x-1/2 animate-[fadeIn_0.15s_ease-out]">
      <div className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">
        <CheckCircle size={18} className="text-green-400" />
        <span>{message}</span>
      </div>
    </div>
  );
};
