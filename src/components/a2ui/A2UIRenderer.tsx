// [Cell 1]: src/components/a2ui/A2UIRenderer.tsx
// AI가 보낸 JSON 데이터를 실제 React 컴포넌트로 변환해 주는 핵심 렌더러입니다.

// [Cell 2]: src/components/a2ui/A2UIRenderer.tsx

"use client";

import React from 'react';
import { A2UI_COMPONENT_MAP, A2UIComponentType } from './index';

export interface A2UIMessage {
  id: string;
  type: string;
  props: any;
}

interface RendererProps {
  messages: A2UIMessage[];
}

export const A2UIRenderer = ({ messages }: RendererProps) => {
  return (
    // 🚀 수정: 부모(page.tsx)의 그리드 레이아웃에 맞춰, 여기서는 Fragment(<>)만 사용합니다.
    <>
      {messages.map((msg) => {
        const ComponentToRender = A2UI_COMPONENT_MAP[msg.type as A2UIComponentType];

        if (!ComponentToRender) {
          return (
            <div key={msg.id} className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-200 text-center">
              ⚠️ 알 수 없는 UI 타입입니다: {msg.type}
            </div>
          );
        }

        return (
          // 🚀 각 카드가 애니메이션과 함께 나타나도록 감쌉니다.
          <div key={msg.id} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* props 단언 유지 */}
            <ComponentToRender {...(msg.props as any)} />
          </div>
        );
      })}
    </>
  );
};