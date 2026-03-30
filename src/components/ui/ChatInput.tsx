// [Cell 1]: src/components/ui/ChatInput.tsx
// 사용자가 에이전트에게 텍스트로 명령을 내릴 수 있는 하단 고정 입력창입니다.

"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const ChatInput = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // 나중에 여기에 실제 에이전트로 메시지를 보내는 로직이 들어갑니다.
    console.log("사용자 입력 전송:", message);
    setMessage(""); // 전송 후 입력창 비우기
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
          placeholder="원하시는 메뉴를 자연스럽게 말씀해 주세요. (예: 매운 버거 2개 세트로 줘)"
          className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg font-medium"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
        >
          <Send size={18} className="ml-1" />
        </button>
      </form>
    </div>
  );
};