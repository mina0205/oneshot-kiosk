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
          <div key={msg.id} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ComponentToRender {...(msg.props as any)} />
          </div>
        );
      })}
    </>
  );
};
