// [Cell 1]: src/components/ui/ChatInput.tsx
// 사용자의 입력을 받아 Next.js 내부 API(/api/chat)로 전송하고 결과를 받는 컴포넌트

"use client";

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react'; // 🚀 Loader2 아이콘 추가

export const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🚀 통신 상태를 추적하는 변수 추가

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const userMessage = message;
    console.log("사용자 입력 전송:", userMessage);
    
    setMessage(""); // 전송 후 입력창 비우기
    setIsLoading(true); // 로딩 스피너 켜기

    try {
      // 우리가 만든 가짜 백엔드(/api/chat)로 메시지 전송
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      // 결과 확인 (나중에 이 부분은 A2UI 렌더러와 연결될 예정입니다)
      if (response.ok) {
        alert(`🤖 Gemini의 답변:\n\n${data.reply}`);
      } else {
        alert(`❌ 에러 발생:\n${data.error}`);
      }

    } catch (error) {
      console.error("통신 에러:", error);
      alert("서버와 통신하는 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false); // 통신이 끝나면 무조건 로딩 끄기
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative flex items-center"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading} // 로딩 중에는 타자 못 치게 막기
          placeholder={isLoading ? "AI가 답변을 생성하고 있습니다..." : "원하시는 메뉴를 자연스럽게 말씀해 주세요. (예: 매운 버거 2개 세트로 줘)"}
          className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
        >
          {/* 로딩 중일 때는 빙글빙글 도는 스피너를, 아닐 때는 종이비행기 아이콘을 보여줍니다 */}
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
        </button>
      </form>
    </div>
  );
};