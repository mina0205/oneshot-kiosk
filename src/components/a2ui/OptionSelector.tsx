// [Cell 1]: src/components/a2ui/OptionSelector.tsx
// 세트/단품, 사이즈 업, 음료 변경 등 옵션을 선택하는 UI의 뼈대입니다.

"use client";

import React from 'react';

export const OptionSelector = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full max-w-md">
      <h3 className="text-xl font-bold text-slate-800 mb-4">옵션 선택</h3>
      
      <div className="flex flex-col gap-3">
        {/* 임시 옵션 버튼들 */}
        <button className="p-4 border-2 border-orange-500 bg-orange-50 rounded-2xl text-left font-bold text-orange-600 transition-colors">
          세트 (+2,500원)
          <p className="text-sm font-normal text-orange-500 mt-1">감자튀김(M) + 코카콜라(M)</p>
        </button>
        
        <button className="p-4 border-2 border-slate-100 hover:border-slate-200 rounded-2xl text-left font-bold text-slate-600 transition-colors">
          단품
          <p className="text-sm font-normal text-slate-400 mt-1">버거만 단품으로 즐기기</p>
        </button>
      </div>
    </div>
  );
};