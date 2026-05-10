"use client";

import React, { useState, useEffect,useMemo } from "react";
import { ZoomIn, ZoomOut, Contrast, RotateCcw } from "lucide-react";
import { A2UIRenderer, A2UIMessage } from "@/components/a2ui/A2UIRenderer";
import { ChatInput } from "@/components/ui/ChatInput";
import { menuData } from "@/data/menuData";
import { fetchMenus, sendChat } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";

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

export default function HomePage() {

  const sessionId = useSessionStore((s) => s.sessionId);
  const setSendMessage = useChatStore((s) => s.setSendMessage);
  const [agentMessages, setAgentMessages] = useState<A2UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");

  const overrideMessages = useUIStore((s) => s.overrideMessages);
  const isHomeRequested = useUIStore((s) => s.isHomeRequested);
  const resetHomeTrigger = useUIStore((s) => s.resetHomeTrigger);

  const [apiMenuMessages, setApiMenuMessages] = useState<A2UIMessage[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("burger");

  // 카테고리 정의
  const CATEGORIES = [
  { key: "burger", label: "🍔 버거" },
  { key: "side",   label: "🍗 사이드" },
  { key: "drink",  label: "🥤 음료" },
];

  // 메뉴 필터링 함수
  const filteredMenus = useMemo(() => {
    const all = apiMenuMessages ?? localMenuMessages;
    const menus = all.filter((msg) => msg.type === "MenuCard");
    return menus.filter((msg) => {
      const cat = msg.props?.category;
      if (activeCategory === "side") {
        return cat === "side" || cat === "chicken" || cat === "iceshot";
      }
      return cat === activeCategory;
    });
  }, [apiMenuMessages, localMenuMessages, activeCategory]);

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
    useUIStore.getState().setOverrideMessages(null);
    setLoading(true);
    setError(null);

        try {
      const response = await withTimeout(sendChat(sessionId, message), 15000);
      const { reply, components } = response;

      if (components && Array.isArray(components)) {
        const newMessages: A2UIMessage[] = components.map((comp: any, index: number) => ({
          id: `agent-${Date.now()}-${index}`,
          type: comp.type,
          props: comp,
        }));
        setAgentMessages(newMessages);
      } else {
        setAgentMessages([]);
      }
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        setError("⚠️ AI 응답이 지연되고 있습니다. 다시 질문해주세요.");
      } else {
        setError("⚠️ 서버 연결이 끊어졌습니다.");
      }
    } finally {
      setLoading(false);
    }
    
  };

  useEffect(() => {
    setSendMessage(handleSend);
  }, [sessionId, allMenuMessages]);


  const baseMessages = agentMessages.length > 0 ? agentMessages : allMenuMessages;

  return (
    <div className={`min-h-screen bg-lotteria-brown flex items-center justify-center p-2 sm:p-6 transition-colors duration-300 ${fontSize === "large" ? "text-lg" : "text-base"}`}>

      {/* 키오스크 프레임 */}
      <div className={`w-full max-w-[600px] h-[95vh] max-h-[1200px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-8 transition-colors duration-300 ${isHighContrast ? "bg-black text-white border-yellow-400" : "bg-lotteria-cream text-slate-900 border-lotteria-red"}`}>

        {/* 헤더 바 */}
        <div className="bg-lotteria-red text-white px-6 py-3 flex justify-between items-center z-50 shadow-md">
          <div className="flex gap-4">
            <button
              onClick={() => setFontSize(prev => prev === "normal" ? "large" : "normal")}
              className="flex items-center gap-1.5 hover:text-lotteria-yellow transition-colors active:scale-95"
            >
              {fontSize === "normal" ? <ZoomIn size={20} /> : <ZoomOut size={20} />}
              <span className="font-bold">{fontSize === "normal" ? "글자크게" : "기본크기"}</span>
            </button>
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`flex items-center gap-1.5 hover:text-lotteria-yellow transition-colors active:scale-95 ${isHighContrast ? "text-lotteria-yellow" : ""}`}
            >
              <Contrast size={20} />
              <span className="font-bold">고대비</span>
            </button>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 bg-lotteria-yellow text-lotteria-brown px-3 py-1.5 rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            처음으로
          </button>
        </div>

        {/* 메인 스크롤 영역 */}
         <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 scroll-smooth">          <header className="mb-8 text-center">
            {/* 롯데리아 스타일 로고 */}
            <div className="inline-flex items-center gap-2 mb-4 mt-2">
              <div className="w-10 h-10 bg-lotteria-red rounded-full flex items-center justify-center">
                <span className="text-white font-black text-lg">L</span>
              </div>
              <h1 className="text-3xl font-black text-lotteria-red">LOTTERIA</h1>
            </div>
            <p className="text-sm text-slate-500 -mt-2 mb-4">OneShot Kiosk</p>

            {/* 바로가기 버튼 */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => handleSend("현재 진행 중인 프로모션 보여줘")}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all shadow-sm"
              >
                🏷️ 프로모션
              </button>
              <button
                onClick={() => handleSend("쿠폰 보여줘")}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all shadow-sm"
              >
                🎟️ 쿠폰
              </button>
              <button
                onClick={() => handleSend("장바구니 보여줘")}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-lotteria-red text-white rounded-full text-sm font-bold hover:bg-lotteria-red-dark active:scale-95 transition-all shadow-sm"
              >
                🛒 장바구니
              </button>
            </div>


          </header>

        {/* 타임아웃이나 서버 에러 시 빨간 배너 */}
          {error && (
            <div className="mx-2 mb-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-200">
              {error}
            </div>
          )}

          {overrideMessages ? (
            <div className="mt-4">
              <button
                onClick={() => {
                  useUIStore.getState().setOverrideMessages(null);
                  setAgentMessages([]);
                }}
                className="mb-3 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all"
              >
                ← 처음으로
              </button>
              <A2UIRenderer messages={overrideMessages} />
            </div>
          ) : agentMessages.length > 0 ? (
            <div className="mt-4">
              <button onClick={() => setAgentMessages([])} className="mb-3 px-4 py-2 bg-lotteria-yellow text-lotteria-brown rounded-full text-sm font-bold hover:bg-yellow-300 active:scale-95 transition-all">
                ← 메뉴로 돌아가기
              </button>
              <A2UIRenderer messages={agentMessages} />
            </div>
          ) : (
            <>
              {/* 기존 카테고리 탭 + 메뉴 그리드 */}
              <div className="flex justify-center gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm ${
                      activeCategory === cat.key
                        ? "bg-lotteria-red text-white ring-2 ring-offset-2 ring-lotteria-red"
                        : "bg-lotteria-gray text-lotteria-brown hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-2 pb-4">
                {filteredMenus.length > 0 ? (
                  <A2UIRenderer messages={filteredMenus} />
                ) : (
                  <p className="col-span-full text-center text-slate-400 py-8">
                    해당 카테고리에 메뉴가 없습니다.
                  </p>
                )}
              </div>
            </>
            
          )}

        </main>

        {/* 하단 챗 인풋 */}
        <div className="sticky bottom-0 left-0 right-0 z-40 bg-lotteria-cream">
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      </div>
    </div>
  );
}
