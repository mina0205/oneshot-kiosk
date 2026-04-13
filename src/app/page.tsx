// [Cell 1]: src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Contrast, RotateCcw } from "lucide-react";
import { A2UIRenderer, A2UIMessage } from "@/components/a2ui/A2UIRenderer";
import { ChatInput } from "@/components/ui/ChatInput";
import { menuData } from "@/data/menuData";
import { fetchMenus, sendChat } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";

// 더미 데이터 메시지 임포트
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

// [Cell 1]: 유틸리티 함수 및 상수 정의
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
};

const fetchWithRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[BE 연결 지연] ${i + 1}번째 재시도 중...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("모든 재시도 실패");
};

const localMenuMessages: A2UIMessage[] = menuData.map((menu, index) => ({
  id: `msg-menu-${index}`,
  type: "MenuCard",
  props: menu,
}));

// [Cell 2]: HomePage 컴포넌트 메인 로직
export default function HomePage() {
  const [mode, setMode] = useState<"agent" | "dummy">("agent");
  const [scenario, setScenario] = useState<string>("s04");

  const sessionId = useSessionStore((s) => s.sessionId);
  const setSendMessage = useChatStore((s) => s.setSendMessage);
  const [agentMessages, setAgentMessages] = useState<A2UIMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 접근성 상태
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");

  const overrideMessages = useUIStore((s) => s.overrideMessages);
  const isHomeRequested = useUIStore((s) => s.isHomeRequested);
  const resetHomeTrigger = useUIStore((s) => s.resetHomeTrigger);

  const [apiMenuMessages, setApiMenuMessages] = useState<A2UIMessage[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithRetry(() => fetchMenus(), 3, 1000)
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
        setApiError("서버와 연결이 불안정하여 로컬 메뉴로 대체합니다.");
        setApiMenuMessages(null);
      });

    if (isHomeRequested) {
      setAgentMessages([]);
      useUIStore.getState().setOverrideMessages(null);
      resetHomeTrigger();
    }
  }, [isHomeRequested, resetHomeTrigger]);

  const allMenuMessages = apiMenuMessages ?? localMenuMessages;

  const handleSend = async (message: string) => {
    setLoading(true);
    setError(null);
    setChatHistory((prev) => [...prev, { role: "user", text: message }]);

    try {
      const response = await withTimeout(sendChat(sessionId, message), 15000);
      const { reply, components } = response;

      if (reply) {
        setChatHistory((prev) => [...prev, { role: "agent", text: reply }]);
      }

      if (components && Array.isArray(components)) {
        const newMessages: A2UIMessage[] = components.map((comp: any, index: number) => ({
          id: `agent-${Date.now()}-${index}`,
          type: comp.type,
          props: comp,
        }));
        setAgentMessages(newMessages);
      } else {
        setAgentMessages([...allMenuMessages, ...cartMessages]);
      }
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        setChatHistory((prev) => [...prev, { role: "agent", text: "⚠️ AI 응답이 지연되고 있습니다. 다시 질문해주세요." }]);
      } else {
        setError(err.message);
        setChatHistory((prev) => [...prev, { role: "agent", text: "⚠️ 서버 연결이 끊어졌습니다." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSendMessage(handleSend);
  }, [sessionId, allMenuMessages]);

  // 팀원들의 모든 더미 시나리오를 연결합니다.
  const SCENARIOS: Record<string, { label: string; messages: A2UIMessage[] }> = {
    s04: { label: "알레르기", messages: allergyMessages },
    s05: { label: "예산/칼로리 추천", messages: comboMessages }, // Mina
    s06: { label: "이전 주문 이력", messages: orderHistoryMessages }, // Mina
    s07: { label: "메뉴 비교", messages: comparisonMessages }, // Mina
    s09: { label: "프로모션/쿠폰", messages: [...promotionMessages, ...couponMessages] }, // Sang
    s10: { label: "커스텀 버거", messages: customBuilderMessages }, // Sang
    done: { label: "주문 완료", messages: orderCompleteMessages },
  };

  const baseMessages = mode === "agent"
    ? agentMessages.length > 0 ? agentMessages : [...allMenuMessages, ...cartMessages]
    : SCENARIOS[scenario].messages;

  const displayMessages = overrideMessages !== null ? overrideMessages : baseMessages;

  // 레이아웃 분류: 메뉴 카드 vs 그 외 컴포넌트
  const menuMessages = displayMessages.filter(m => m.type === 'MenuCard');
  const otherMessages = displayMessages.filter(m => m.type !== 'MenuCard');

  // [Cell 3]: 렌더링 JSX
  return (
    <div className={`min-h-screen bg-slate-800 flex items-center justify-center p-2 sm:p-6 transition-colors duration-300 ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
      
      {/* 가상 키오스크 기기 프레임 */}
      <div className={`w-full max-w-[600px] h-[90vh] max-h-[1080px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-8 border-slate-900 transition-colors duration-300 ${isHighContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* 접근성 바 (헤더) */}
        <div className="bg-slate-900 text-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-md">
          <div className="flex gap-4">
            <button 
              onClick={() => setFontSize(prev => prev === "normal" ? "large" : "normal")}
              className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95"
            >
              {fontSize === "normal" ? <ZoomIn size={20}/> : <ZoomOut size={20}/>}
              <span className="font-bold">{fontSize === "normal" ? "글자크게" : "기본크기"}</span>
            </button>
            <button 
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`flex items-center gap-1.5 hover:text-white transition-colors active:scale-95 ${isHighContrast ? 'text-yellow-400' : ''}`}
            >
              <Contrast size={20}/>
              <span className="font-bold">고대비</span>
            </button>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-red-600 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            처음으로
          </button>
        </div>

        {/* 메인 스크롤 영역 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-60 scroll-smooth">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-black mb-4 mt-2">OneShot Kiosk</h1>
            <div className="flex justify-center gap-3">
              <button onClick={() => setMode("agent")} className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm active:scale-95 ${mode === "agent" ? "bg-orange-600 text-white" : (isHighContrast ? "bg-gray-800 text-white" : "bg-white text-slate-600")}`}>AI 에이전트</button>
              <button onClick={() => setMode("dummy")} className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm active:scale-95 ${mode === "dummy" ? "bg-orange-600 text-white" : (isHighContrast ? "bg-gray-800 text-white" : "bg-white text-slate-600")}`}>더미 테스트</button>
            </div>

            {/* 더미 테스트 모드일 때 시나리오 버튼 렌더링 (flex-wrap 적용) */}
            {mode === "dummy" && (
              <div className="flex flex-wrap justify-center gap-2 mt-5 animate-in fade-in slide-in-from-top-2 max-w-md mx-auto">
                {Object.entries(SCENARIOS).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setScenario(key)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
                      scenario === key 
                        ? "bg-slate-700 text-white" 
                        : (isHighContrast ? "bg-gray-700 text-slate-300" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100")
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* 메뉴 카드 바둑판(Grid) */}
          {menuMessages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full z-10 relative">
              <A2UIRenderer messages={menuMessages} />
            </div>
          )}

          {/* 기타 컴포넌트(장바구니, 옵션창, 비교표 등) */}
          {otherMessages.length > 0 && (
            <div className="flex flex-col gap-6 w-full mt-6 mb-10 z-[60] items-center">
              <A2UIRenderer messages={otherMessages} />
            </div>
          )}
        </main>

        {/* 하단 챗 인풋 고정 */}
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      </div>
    </div>
  );
}