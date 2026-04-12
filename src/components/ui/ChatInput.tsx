// [Cell 1]: src/components/ui/ChatInput.tsx

"use client";

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

// 🚀 1. 부모 컴포넌트(page.tsx)에서 던져주는 데이터를 받을 수 있도록 '타입(인터페이스)'을 정의합니다.
interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

// 🚀 2. props로 onSend 함수와 loading 상태를 받아옵니다.
export const ChatInput = ({ onSend, loading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
    const userMessage = message;
    setMessage(""); // 전송 후 입력창 비우기
    
    // 🚀 3. 내부에서 직접 통신(fetch)하지 않고, 부모가 준 onSend 함수에 메시지를 담아 던집니다!
    onSend(userMessage);
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
          disabled={loading} // 부모가 로딩 중이라고 하면 타자 못 치게 막기
          placeholder={loading ? "AI가 답변을 생성하고 있습니다..." : "원하시는 메뉴를 자연스럽게 말씀해 주세요. (예: 매운 버거 2개 세트로 줘)"}
          className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
        </button>
      </form>
    </div>
  );
};