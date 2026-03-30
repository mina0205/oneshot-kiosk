// [Cell 2]: src/app/page.tsx

"use client";

import React, { useState } from 'react';
import { A2UIRenderer, A2UIMessage } from '@/components/a2ui/A2UIRenderer';
import { ChatInput } from '@/components/ui/ChatInput';
import { menuData } from '@/data/menuData'; // 🔥 우리가 만든 8개 메뉴 데이터 불러오기

export default function HomePage() {
  // menuData 창고에 있는 8개의 버거를 모두 'MENU_CARD' 메시지로 변환합니다.
  const initialMessages: A2UIMessage[] = menuData.map((menu, index) => ({
    id: `msg-menu-${index}`,
    type: 'MENU_CARD',
    props: menu // 메뉴 데이터를 통째로 카드에 넘겨줍니다.
  }));

  // 장바구니 화면도 맨 마지막에 하나 추가해줍니다.
  initialMessages.push({
    id: 'msg-cart',
    type: 'CART_VIEW',
    props: {}
  });

  const [messages, setMessages] = useState<A2UIMessage[]>(initialMessages);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-900">OneShot AI</h1>
          <p className="text-slate-500 mt-2">새로운 스키마가 완벽하게 적용되었습니다.</p>
        </header>

        <div className="pb-20">
          {/* 그리드 레이아웃을 주어 메뉴가 한 줄에 2~3개씩 예쁘게 정렬되도록 했습니다. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto items-start">
            <A2UIRenderer messages={messages} />
          </div>
        </div>
      </main>

      <ChatInput />
    </div>
  );
}