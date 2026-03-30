import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// 주문 완료 화면
export const orderCompleteMessages: A2UIMessage[] = [
  {
    id: "complete-001",
    type: "OrderComplete",
    props: {
      orderId: "ORD-20260330-001",
      orderNumber: 37,
      estimatedTime: 5,
      finalPrice: 41800,
      orderType: "dineIn",
    },
  },
];
