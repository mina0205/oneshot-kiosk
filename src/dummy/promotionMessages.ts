import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-09: "지금 할인 중인 메뉴 뭐 있어?"
export const promotionMessages: A2UIMessage[] = [
  {
    id: "s09-promo",
    type: "PromotionBanner",
    props: {
      promotions: [
        {
          title: "리아 런치 20% 할인",
          description: "평일 11시~14시 버거 단품 적용",
          discountType: "rate",
          discountValue: 20,
          applicableCount: 5,
        },
        {
          title: "세트 업그레이드 무료",
          description: "이번 주 세트 주문 시 사이드 업그레이드 무료",
          discountType: "amount",
          discountValue: 500,
          applicableCount: 9,
        },
      ],
    },
  },
];
