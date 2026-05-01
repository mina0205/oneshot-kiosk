"use client";

import React from "react";
import { motion } from "framer-motion";
import { History, RotateCcw, Clock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface HistoryItem {
  name: string;
  quantity: number;
}

interface PastOrder {
  orderId: string;
  createdAt: string;
  items: HistoryItem[];
  totalPrice: number;
}

export interface OrderHistoryProps {
  orders: PastOrder[];
}

export const OrderHistory = (props: OrderHistoryProps) => {
  const { orders } = props;
  const addItem = useCartStore((state) => state.addItem);

  const handleReorder = (order: PastOrder) => {
    order.items.forEach((item, idx) => {
      addItem({
        cartItemId: `reorder-${order.orderId}-${idx}-${Date.now()}`,
        menuId: `reorder-${order.orderId}-${idx}`,
        name: item.name,
        isSet: false,
        quantity: item.quantity,
        unitPrice: Math.round(order.totalPrice / order.items.reduce((sum, i) => sum + i.quantity, 0)),
        subtotal: Math.round(order.totalPrice / order.items.reduce((sum, i) => sum + i.quantity, 0)) * item.quantity,
      });
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md mx-auto"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-5">
        <History size={22} className="text-violet-500" />
        <h3 className="text-xl font-bold text-slate-800">이전 주문 내역</h3>
      </div>

      {/* 주문 카드 */}
      <div className="flex flex-col gap-4">
        {orders.map((order, idx) => (
          <motion.div
            key={order.orderId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border-2 border-slate-100 rounded-2xl p-4 hover:border-violet-300 transition-colors"
          >
            {/* 주문 날짜 + ID */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <Clock size={14} /> {formatDate(order.createdAt)}
              </span>
              <span className="text-xs text-slate-300">{order.orderId}</span>
            </div>

            {/* 주문 항목 */}
            <div className="flex flex-col gap-1 mb-3">
              {order.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex justify-between text-sm"
                >
                  <span className="text-slate-600">{item.name}</span>
                  <span className="text-slate-400">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* 합계 + 재주문 */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-800">
                {order.totalPrice.toLocaleString()}원
              </span>
              <button
                onClick={() => handleReorder(order)}
                className="bg-violet-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-600 active:scale-[0.98] transition-all flex items-center gap-1"
              >
                <RotateCcw size={14} /> 다시 주문
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
