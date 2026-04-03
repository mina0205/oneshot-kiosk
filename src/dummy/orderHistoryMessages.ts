import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-06: "지난번에 시킨 거 그대로 다시 주문해줘"
export const orderHistoryMessages: A2UIMessage[] = [
  {
    id: "s06-history",
    type: "OrderHistory",
    props: {
      orders: [
        {
          orderId: "ORD-20260325-012",
          createdAt: "2026-03-25T12:30:00",
          items: [
            { name: "리아 불고기 세트", quantity: 1 },
            { name: "치킨버거", quantity: 1 },
          ],
          totalPrice: 13700,
        },
        {
          orderId: "ORD-20260320-008",
          createdAt: "2026-03-20T18:45:00",
          items: [
            { name: "한우불고기버거 세트", quantity: 2 },
            { name: "데리버거", quantity: 1 },
          ],
          totalPrice: 28900,
        },
      ],
    },
  },
];
