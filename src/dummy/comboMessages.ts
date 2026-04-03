import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-05: "2만원 안에서 3명이 먹을 수 있는 조합 추천해줘"
export const comboMessages: A2UIMessage[] = [
  {
    id: "s05-combo",
    type: "ComboRecommendation",
    props: {
      budget: 20000,
      headcount: 3,
      combos: [
        {
          comboId: "combo-a",
          label: "조합 A — 가성비 추천",
          items: [
            { name: "데리버거 세트", price: 7400 },
            { name: "데리버거 세트", price: 7400 },
            { name: "데리버거", price: 4500 },
          ],
          totalPrice: 19300,
          remaining: 700,
        },
        {
          comboId: "combo-b",
          label: "조합 B — 균형 추천",
          items: [
            { name: "리아 불고기", price: 5800 },
            { name: "치킨버거", price: 5100 },
            { name: "데리버거 세트", price: 7400 },
          ],
          totalPrice: 18300,
          remaining: 1700,
        },
      ],
    },
  },
];
