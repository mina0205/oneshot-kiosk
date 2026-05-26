// src/components/ui/ChatInput.tsx
"use client";

import React, { useState, useRef } from 'react';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

export const ChatInput = ({ onSend, loading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    const userMessage = message;
    setMessage("");
    onSend(userMessage);
  };

  const handleMicClick = async () => {
    if (isRecording) {
      console.log("수동 녹음 중지");
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      console.log("마이크 접근 시도...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("마이크 접근 성공!");

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log("데이터 수신:", e.data.size);
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("녹음 종료! chunks 수:", chunksRef.current.length);
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("오디오 블롭 크기:", audioBlob.size, "bytes");

        if (audioBlob.size === 0) {
          console.error("오디오 데이터가 없습니다!");
          return;
        }

        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "audio.webm");
          console.log("STT API 요청 전송 중...");

          const res = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          });

          console.log("STT 응답 상태:", res.status);
          const data = await res.json();
          console.log("STT 결과:", data);

          if (data.text && data.text.trim()) {
            console.log("인식된 텍스트:", data.text);
            onSend(data.text.trim());
          } else {
            console.warn("인식된 텍스트 없음");
          }
        } catch (err) {
          console.error("STT 오류:", err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      console.log("녹음 시작!");
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          console.log("5초 타임아웃 - 자동 중지");
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);

    } catch (err) {
      console.error("마이크 접근 오류:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleMicClick}
          disabled={loading || isTranscribing}
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : isTranscribing
              ? "bg-slate-300 text-slate-500"
              : "bg-orange-100 text-orange-500 hover:bg-orange-200"
          }`}
        >
          {isTranscribing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isRecording ? (
            <MicOff size={20} />
          ) : (
            <Mic size={20} />
          )}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || isRecording || isTranscribing}
            placeholder={
              isRecording
                ? "🎙️ 말씀하세요... (5초 후 자동 종료)"
                : isTranscribing
                ? "변환 중..."
                : "원하시는 메뉴를 말씀해 주세요."
            }
            className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
          </button>
        </div>
      </form>

      {isRecording && (
        <p className="text-center text-red-500 text-sm font-bold mt-2 animate-pulse">
          🔴 녹음 중... 다시 누르면 중지
        </p>
      )}
    </div>
  );
};
