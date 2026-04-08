"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

export const ChatInput = ({ onSend, loading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSend(message.trim());
    setMessage("");
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
          placeholder={
            loading 
              ? "에이전트 응답을 기다리는 중..." 
              : "원하시는 메뉴를 자연스럽게 말씀해 주세요. (예: 매운 버거 2개 세트로 줘)"
          }
          disabled={loading}
          maxLength={500}
          className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg font-medium disabled:bg-slate-200 disabled:text-slate-400"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={18} className="ml-1" />
          )}
        </button>
      </form>
    </div>
  );
};
