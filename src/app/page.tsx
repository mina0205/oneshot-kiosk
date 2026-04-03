"use client";

import React, { useState } from "react";
import { A2UIRenderer, A2UIMessage } from "@/components/a2ui/A2UIRenderer";
import { ChatInput } from "@/components/ui/ChatInput";
import { menuData } from "@/data/menuData";

// 더미 시나리오 import
import { menuCardMessages } from "@/dummy/menuCardMessages";
import { cartMessages } from "@/dummy/cartMessages";
import { optionSelectorMessages } from "@/dummy/optionSelectorMessages";
import { paymentMessages } from "@/dummy/paymentMessages";
import { allergyMessages } from "@/dummy/allergyMessages";
import { orderCompleteMessages } from "@/dummy/orderCompleteMessages";
import { comboMessages } from "@/dummy/comboMessages";
import { orderHistoryMessages } from "@/dummy/orderHistoryMessages";
import { comparisonMessages } from "@/dummy/comparisonMessages";

// 전체 메뉴 (기본 화면)
const allMenuMessages: A2UIMessage[] = menuData.map((menu, index) => ({
  id: `msg-menu-${index}`,
  type: "MenuCard",
  props: menu,
}));

// 시나리오 목록
const SCENARIOS: Record<string, { label: string; messages: A2UIMessage[] }> = {
  all: { label: "전체 메뉴", messages: [...allMenuMessages, ...cartMessages] },
  "s02": { label: "S-02 칼로리 추천", messages: [...menuCardMessages, ...cartMessages] },
  "s03": { label: "S-03 세트 옵션", messages: [...optionSelectorMessages, ...cartMessages] },
  "s04": { label: "S-04 알레르기 필터", messages: [...allergyMessages, ...cartMessages] },
  "s05": { label: "S-05 예산 추천", messages: [...comboMessages, ...cartMessages] },
  "s06": { label: "S-06 리오더", messages: [...orderHistoryMessages, ...cartMessages] },
  "s07": { label: "S-07 메뉴 비교", messages: [...comparisonMessages, ...cartMessages] },
  "s09": { label: "S-09 결제 화면", messages: paymentMessages },
  "done": { label: "주문 완료", messages: orderCompleteMessages },
};

export default function HomePage() {
  const [scenario, setScenario] = useState<string>("all");
  const messages = SCENARIOS[scenario].messages;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-black text-slate-900">OneShot AI</h1>
          <p className="text-slate-500 mt-1">시나리오별 더미 데이터 테스트</p>
        </header>

        {/* 시나리오 전환 버튼 */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {Object.entries(SCENARIOS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                scenario === key
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto items-start">
            <A2UIRenderer messages={messages} />
          </div>
        </div>
      </main>

      <ChatInput />
    </div>
  );
}
