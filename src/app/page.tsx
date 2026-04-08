"use client";

import React, { useState, useEffect } from "react";
import { A2UIRenderer, A2UIMessage } from "@/components/a2ui/A2UIRenderer";
import { ChatInput } from "@/components/ui/ChatInput";
import { menuData } from "@/data/menuData";
import { fetchMenus, sendChat } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";
import { useSessionStore } from "@/store/sessionStore";
import { useChatStore } from "@/store/chatStore";


// 더미 데이터 (fallback용)
import { menuCardMessages } from "@/dummy/menuCardMessages";
import { cartMessages } from "@/dummy/cartMessages";
import { optionSelectorMessages } from "@/dummy/optionSelectorMessages";
import { paymentMessages } from "@/dummy/paymentMessages";
import { allergyMessages } from "@/dummy/allergyMessages";
import { orderCompleteMessages } from "@/dummy/orderCompleteMessages";
import { comboMessages } from "@/dummy/comboMessages";
import { orderHistoryMessages } from "@/dummy/orderHistoryMessages";
import { comparisonMessages } from "@/dummy/comparisonMessages";
import { promotionMessages } from "@/dummy/promotionMessages";
import { couponMessages } from "@/dummy/couponMessages";
import { customBuilderMessages } from "@/dummy/customBuilderMessages";


const localMenuMessages: A2UIMessage[] = menuData.map((menu, index) => ({
  id: `msg-menu-${index}`,
  type: "MenuCard",
  props: menu,
}));

export default function HomePage() {
  // 모드 전환: "agent" (에이전트 연동) / "dummy" (더미 시나리오)
  const [mode, setMode] = useState<"agent" | "dummy">("agent");
  const [scenario, setScenario] = useState<string>("all");

  // 에이전트 관련 상태
  const sessionId = useSessionStore((s) => s.sessionId);
  const setSendMessage = useChatStore((s) => s.setSendMessage);
  const [agentMessages, setAgentMessages] = useState<A2UIMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 메뉴 로딩 (BE API)
  const [apiMenuMessages, setApiMenuMessages] = useState<A2UIMessage[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus()
      .then((menus) => {
        const messages: A2UIMessage[] = menus.map((menu: any, index: number) => ({
          id: `api-menu-${index}`,
          type: "MenuCard",
          props: menu,
        }));
        setApiMenuMessages(messages);
        setApiError(null);
      })
      .catch((err) => {
        console.warn("BE API 연결 실패:", err.message);
        setApiError(err.message);
        setApiMenuMessages(null);
      });
  }, []);

  const allMenuMessages = apiMenuMessages ?? localMenuMessages;

  // 에이전트 채팅 전송
  const handleSend = async (message: string) => {
  setLoading(true);
  setError(null);

  setChatHistory((prev) => [...prev, { role: "user", text: message }]);

  try {
    const response = await sendChat(sessionId, message);

    // BE 응답: { reply: string, components: [...] | null }
    const { reply, components } = response;

    // 에이전트 텍스트 응답을 히스토리에 추가
    if (reply) {
      setChatHistory((prev) => [...prev, { role: "agent", text: reply }]);
    }

    // components가 있으면 A2UI 메시지로 변환
    if (components && Array.isArray(components)) {
      const newMessages: A2UIMessage[] = components.map((comp: any, index: number) => ({
        id: `agent-${Date.now()}-${index}`,
        type: comp.type,
        props: comp,
      }));
      setAgentMessages(newMessages);
    } else {
      // components가 null이면 기존 메뉴 유지
      setAgentMessages([...allMenuMessages, ...cartMessages]);
    }
  } catch (err: any) {
    console.error("에이전트 호출 실패:", err);
    setError(err.message || "에이전트 연결에 실패했습니다");
  } finally {
    setLoading(false);
  }
};

  // handleSend를 전역 store에 등록
  useEffect(() => {
    setSendMessage(handleSend);
  }, [sessionId, allMenuMessages]);

  // 더미 시나리오 맵
  const SCENARIOS: Record<string, { label: string; messages: A2UIMessage[] }> = {
    all: { label: "전체 메뉴", messages: [...allMenuMessages, ...cartMessages] },
    s02: { label: "S-02 칼로리 추천", messages: [...menuCardMessages, ...cartMessages] },
    s03: { label: "S-03 세트 옵션", messages: [...optionSelectorMessages, ...cartMessages] },
    s04: { label: "S-04 알레르기 필터", messages: [...allergyMessages, ...cartMessages] },
    s05: { label: "S-05 예산 추천", messages: [...comboMessages, ...cartMessages] },
    s06: { label: "S-06 리오더", messages: [...orderHistoryMessages, ...cartMessages] },
    s07: { label: "S-07 메뉴 비교", messages: [...comparisonMessages, ...cartMessages] },
    s09: { label: "S-09 프로모션", messages: [...promotionMessages, ...couponMessages, ...paymentMessages] },
    s10: { label: "S-10 커스텀 버거", messages: [...customBuilderMessages, ...cartMessages] },
    done: { label: "주문 완료", messages: orderCompleteMessages },
  };

  // 현재 화면에 표시할 메시지
  const displayMessages =
    mode === "agent"
      ? agentMessages.length > 0
        ? agentMessages
        : [...allMenuMessages, ...cartMessages] // 에이전트 응답 전에는 전체 메뉴
      : SCENARIOS[scenario].messages;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8">
        {/* 헤더 */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-black text-slate-900">OneShot AI</h1>

          {/* 모드 전환 버튼 */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setMode("agent")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "agent"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              에이전트 모드
            </button>
            <button
              onClick={() => setMode("dummy")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "dummy"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              더미 시나리오
            </button>
          </div>

          {/* 상태 표시 */}
          {mode === "agent" && (
            <div className="mt-2">
              {apiError ? (
                <p className="text-xs text-orange-500">
                  ⚠️ BE 서버 미연결 — 로컬 더미 데이터 사용 중
                </p>
              ) : apiMenuMessages ? (
                <p className="text-xs text-green-500">
                  ✅ BE API 연동 성공 — 메뉴 {apiMenuMessages.length}개 로드
                </p>
              ) : null}
              {error && (
                <p className="text-xs text-red-500 mt-1">❌ {error}</p>
              )}
            </div>
          )}
        </header>

        {/* 더미 모드: 시나리오 버튼 */}
        {mode === "dummy" && (
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
        )}

        {/* 에이전트 모드: 대화 히스토리 */}
        {mode === "agent" && chatHistory.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6 space-y-2">
            {chatHistory.map((chat, i) => (
              <div
                key={i}
                className={`px-4 py-2 rounded-2xl text-sm w-fit max-w-[80%] ${
                  chat.role === "user"
                    ? "ml-auto bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-100"
                }`}
              >
                {chat.text}
              </div>
            ))}
            {loading && (
              <div className="px-4 py-2 rounded-2xl text-sm bg-white text-slate-400 border border-slate-100 w-fit">
                응답 생성 중...
              </div>
            )}
          </div>
        )}

        {/* 컴포넌트 렌더링 */}
        <div className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto items-start">
            <A2UIRenderer messages={displayMessages} />
          </div>
        </div>
      </main>

      {/* 채팅 입력 — 에이전트 모드에서만 활성화 */}
      <ChatInput
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
}
