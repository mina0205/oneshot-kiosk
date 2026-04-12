// [Cell 2]: src/components/a2ui/OptionSelector.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ShoppingBag, X } from "lucide-react"; // X 아이콘 추가
import { useCartStore } from "@/store/cartStore";
import { setOptionsData } from "@/data/menuData";
import { useSessionStore } from "@/store/sessionStore";
import { useUIStore } from "@/store/uiStore";

export interface OptionSelectorProps {
  menuId: string;
  menuName: string;
  menuPrice: number;
  setPrice: number;
  image?: string;
}

type Step = "side" | "drink" | "confirm";

export const OptionSelector = (props: OptionSelectorProps) => {
  const { menuId, menuName, menuPrice, setPrice } = props;
  const addItem = useCartStore((state) => state.addItem);
  const sessionId = useSessionStore((s) => s.sessionId);  
  
  const goHome = useUIStore((s) => s.goHome); 

  const [step, setStep] = useState<Step>("side");
  const [selectedSide, setSelectedSide] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState<"R" | "L">("R");

  const sidePriceDiff = setOptionsData.sides.find((s) => s.menuId === selectedSide)?.priceDiff ?? 0;
  const selectedDrinkItem = setOptionsData.drinks.find(
    (d) => d.menuId === selectedDrink && d.size === selectedDrinkSize
  );
  const drinkPriceDiff = selectedDrinkItem?.priceDiff ?? 0;

  const finalPrice = setPrice + sidePriceDiff + drinkPriceDiff;

  const handleConfirm = () => {
    const sideName = setOptionsData.sides.find((s) => s.menuId === selectedSide)?.name ?? "";
    const drinkName = selectedDrinkItem?.name ?? "";

    addItem(
      {
        cartItemId: `${menuId}-set-${Date.now()}`,
        menuId,
        name: `${menuName} 세트`,
        isSet: true,
        quantity: 1,
        unitPrice: finalPrice,
        subtotal: finalPrice,
        selectedSide: sideName,
        selectedDrink: drinkName,
        drinkSize: selectedDrinkSize,
      },
      sessionId
    );

    goHome();
  };

  const uniqueDrinks = setOptionsData.drinks.filter((d) => d.size === "R");

  return (
    // 🚀 1. 모달 배경 자체를 스크롤 가능하게(overflow-y-auto) 만들고, 위쪽 여백(pt-8)을 줍니다!
    <div className="absolute inset-0 bg-black/60 z-50 flex items-start justify-center pt-8 pb-8 p-4 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        // 🚀 2. 모달 내부에 h-fit과 여백을 주어 자연스럽게 늘어나게 합니다.
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 w-full max-w-[480px] flex flex-col h-fit relative my-auto"
      >
        <button onClick={goHome} className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
          <X size={22} />
        </button>

        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
          {step !== "side" && (
            <button
              onClick={() => setStep(step === "drink" ? "side" : "drink")}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
          )}
          <div className="flex-1 text-center">
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{menuName} 세트 구성</h3>
            <p className="text-base text-orange-600 font-bold mt-1">
              {step === "side" && "Step 1: 사이드 메뉴 선택"}
              {step === "drink" && "Step 2: 음료 메뉴 선택"}
              {step === "confirm" && "Step 3: 최종 선택 확인"}
            </p>
          </div>
        </div>

        {/* 🚀 3. 스텝 인디케이터 (더 직관적이고 굵게) */}
        <div className="flex gap-3 mb-8">
          {(["side", "drink", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-2.5 w-full rounded-full transition-colors ${
                  (["side", "drink", "confirm"] as Step[]).indexOf(step) >= i ? "bg-orange-500" : "bg-slate-200"
              }`} />
              <span className={`text-xs font-bold ${
                  (["side", "drink", "confirm"] as Step[]).indexOf(step) >= i ? "text-orange-600" : "text-slate-400"
              }`}>
                {s === 'side' ? '사이드' : s === 'drink' ? '음료' : '확인'}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* 🚀 4. 옵션 아이템들 (그리드 형태로 크게 키워서 터치하기 편하게) */}
          {(step === "side" || step === "drink") && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-4 h-[300px] overflow-y-auto pr-2 scrollbar-hide"
            >
              {(step === "side" ? setOptionsData.sides : uniqueDrinks).map((item: any) => (
                <button
                  key={item.menuId}
                  onClick={() => {
                    step === "side" ? setSelectedSide(item.menuId) : setSelectedDrink(item.menuId);
                    if (step === "drink") setSelectedDrinkSize("R"); // 음료 선택 시 R로 초기화
                    setStep(step === "side" ? "drink" : "confirm");
                  }}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-4 transition-all text-center relative aspect-[5/4] ${
                    (step === "side" ? selectedSide : selectedDrink) === item.menuId
                      ? "border-orange-500 bg-orange-50 shadow-inner"
                      : "border-slate-100 hover:border-slate-200 bg-white shadow-sm"
                  }`}
                >
                  {/* 이미지 Placeholder (나중에 진짜 사진 넣을 자리) */}
                  <div className="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center text-slate-300 text-xs">사진</div>
                  
                  <span className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.name}</span>
                  {item.priceDiff > 0 && (
                    <span className="text-sm text-orange-600 font-black">
                      +{item.priceDiff.toLocaleString()}원
                    </span>
                  )}
                  {item.priceDiff === 0 && (
                    <span className="text-sm text-slate-400 font-bold">추가금 없음</span>
                  )}
                   {(step === "side" ? selectedSide : selectedDrink) === item.menuId && (
                     <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1"><Check size={16}/></div>
                   )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 3: 확인 (더 깔끔하게 정리) */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              {/* 음료 사이즈 토글 (키우고 디자인 개선) */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl shadow-inner">
                <span className="text-base font-bold text-slate-700">음료 L사이즈로 업그레이드</span>
                <button
                  onClick={() => setSelectedDrinkSize((prev) => (prev === "R" ? "L" : "R"))}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${selectedDrinkSize === "L" ? "bg-orange-500" : "bg-slate-300"}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute transition-transform ${selectedDrinkSize === "L" ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>

              {/* 선택 요약 카드 */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3 shadow-md">
                <div className="flex justify-between items-baseline"><span className="text-base text-slate-500 font-medium">메뉴</span><span className="text-lg font-black text-slate-900">{menuName} 세트</span></div>
                <div className="border-t border-slate-100 my-1"/>
                <div className="flex justify-between items-baseline"><span className="text-base text-slate-500 font-medium">사이드</span><span className="text-base font-bold text-slate-800">{setOptionsData.sides.find((s) => s.menuId === selectedSide)?.name ?? "-"}</span></div>
                <div className="flex justify-between items-baseline"><span className="text-base text-slate-500 font-medium">음료</span><span className="text-base font-bold text-slate-800">{setOptionsData.drinks.find((d) => d.menuId === selectedDrink)?.name ?? "-"}{" "}({selectedDrinkSize})</span></div>
                <div className="border-t-2 border-dashed border-slate-200 my-2" />
                <div className="flex justify-between items-end"><span className="font-black text-xl text-slate-900">최종 세트 가격</span><span className="text-3xl font-black text-orange-600">{finalPrice.toLocaleString()}원</span></div>
              </div>

              {/* 담기 버튼 (크고 강조되게) */}
              <button onClick={handleConfirm} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3">
                <ShoppingBag size={24} /> 장바구니에 담기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};