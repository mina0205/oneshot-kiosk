import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-09: "쿠폰 적용하면 얼마야?"
export const couponMessages: A2UIMessage[] = [
  {
    id: "s09-coupon",
    type: "CouponSelector",
    props: {
      coupons: [
        {
          couponId: "coupon-001",
          title: "첫 주문 2,000원 할인",
          discountType: "amount",
          discountValue: 2000,
          minOrderPrice: 10000,
          expiresAt: "2026-04-30T23:59:59",
          isApplicable: true,
        },
        {
          couponId: "coupon-002",
          title: "세트 메뉴 10% 할인",
          discountType: "rate",
          discountValue: 10,
          minOrderPrice: 8000,
          expiresAt: "2026-04-15T23:59:59",
          isApplicable: true,
        },
        {
          couponId: "coupon-003",
          title: "프리미엄 버거 3,000원 할인",
          discountType: "amount",
          discountValue: 3000,
          minOrderPrice: 15000,
          expiresAt: "2026-03-31T23:59:59",
          isApplicable: false,
        },
      ],
    },
  },
];
