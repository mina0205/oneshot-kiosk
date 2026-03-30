"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { setOptionsData } from "@/data/menuData";

// 에이전트(또는 더미)가 보내주는 Props
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

  const [step, setStep] = useState<Step>("side");
  const [selectedSide, setSelectedSide] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [selectedDrinkSize, setSelectedDrinkSize] = useState<"R" | "L">("R");

  // 선택된 사이드/음료의 추가 금액 계산
  const sidePriceDiff =
    setOptionsData.sides.find((s) => s.menuId === selectedSide)?.priceDiff ?? 0;

  const selectedDrinkItem = setOptionsData.drinks.find(
    (d) => d.menuId === selectedDrink && d.size === selectedDrinkSize
  );
  const drinkPriceDiff = selectedDrinkItem?.priceDiff ?? 0;

  const finalPrice = setPrice + sidePriceDiff + drinkPriceDiff;

  // 장바구니에 세트 추가
  const handleConfirm = () => {
    const sideName =
      setOptionsData.sides.find((s) => s.menuId === selectedSide)?.name ?? "";
    const drinkName = selectedDrinkItem?.name ?? "";

    addItem({
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
    });

    // 초기화
    setStep("side");
    setSelectedSide(null);
    setSelectedDrink(null);
    setSelectedDrinkSize("R");
  };

  // 음료 목록에서 사이즈별 중복 제거 (R 사이즈만 이름 표시, L은 사이즈 업 버튼으로)
  const uniqueDrinks = setOptionsData.drinks.filter((d) => d.size === "R");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 w-full max-w-md"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        {step !== "side" && (
          <button
            onClick={() => setStep(step === "drink" ? "side" : "drink")}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
        )}
        <div>
          <h3 className="text-xl font-bold text-slate-800">{menuName} 세트</h3>
          <p className="text-sm text-slate-400">
            {step === "side" && "사이드를 선택하세요"}
            {step === "drink" && "음료를 선택하세요"}
            {step === "confirm" && "선택을 확인하세요"}
          </p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex gap-2 mb-5">
        {(["side", "drink", "confirm"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              (["side", "drink", "confirm"] as Step[]).indexOf(step) >= i
                ? "bg-orange-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: 사이드 선택 */}
        {step === "side" && (
          <motion.div
            key="side"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-2"
          >
            {setOptionsData.sides.map((side) => (
              <button
                key={side.menuId}
                onClick={() => {
                  setSelectedSide(side.menuId);
                  setStep("drink");
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedSide === side.menuId
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div>
                  <span className="font-bold text-slate-800">{side.name}</span>
                  {side.priceDiff > 0 && (
                    <span className="ml-2 text-sm text-orange-500 font-medium">
                      +{side.priceDiff.toLocaleString()}원
                    </span>
                  )}
                  {side.priceDiff === 0 && (
                    <span className="ml-2 text-sm text-slate-400">기본</span>
                  )}
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 2: 음료 선택 */}
        {step === "drink" && (
          <motion.div
            key="drink"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-2"
          >
            {uniqueDrinks.map((drink) => {
              const lSize = setOptionsData.drinks.find(
                (d) => d.name === drink.name && d.size === "L"
              );

              return (
                <button
                  key={drink.menuId}
                  onClick={() => {
                    setSelectedDrink(drink.menuId);
                    setSelectedDrinkSize("R");
                    setStep("confirm");
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedDrink === drink.menuId
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-800">
                      {drink.name}
                    </span>
                    {drink.priceDiff > 0 && (
                      <span className="ml-2 text-sm text-orange-500 font-medium">
                        +{drink.priceDiff.toLocaleString()}원
                      </span>
                    )}
                    {drink.priceDiff === 0 && (
                      <span className="ml-2 text-sm text-slate-400">기본</span>
                    )}
                    {lSize && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        L사이즈 +{lSize.priceDiff.toLocaleString()}원
                      </p>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Step 3: 확인 */}
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            {/* 사이즈 업 토글 */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-600">
                음료 L사이즈로 변경
              </span>
              <button
                onClick={() =>
                  setSelectedDrinkSize((prev) => (prev === "R" ? "L" : "R"))
                }
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  selectedDrinkSize === "L" ? "bg-orange-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    selectedDrinkSize === "L"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* 선택 요약 */}
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">메뉴</span>
                <span className="font-bold text-slate-800">{menuName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">사이드</span>
                <span className="font-medium text-slate-700">
                  {setOptionsData.sides.find((s) => s.menuId === selectedSide)
                    ?.name ?? "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">음료</span>
                <span className="font-medium text-slate-700">
                  {setOptionsData.drinks.find(
                    (d) => d.menuId === selectedDrink
                  )?.name ?? "-"}{" "}
                  ({selectedDrinkSize})
                </span>
              </div>
              <div className="border-t border-slate-200 my-1" />
              <div className="flex justify-between">
                <span className="font-bold text-slate-800">합계</span>
                <span className="text-xl font-black text-orange-600">
                  {finalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 확인 버튼 */}
            <button
              onClick={handleConfirm}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              장바구니에 담기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
