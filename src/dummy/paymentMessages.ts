import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-09: 프로모션 할인 적용 결제
export const paymentMessages: A2UIMessage[] = [
  {
    id: "s09-payment",
    type: "PaymentSummary",
    props: {
      items: [
        { name: "리아 불고기 세트", quantity: 3, subtotal: 25800, isSet: true, selectedSide: "포테이토(R)", selectedDrink: "제로슈거콜라" },
        { name: "치킨버거 세트", quantity: 2, subtotal: 16000, isSet: true, selectedSide: "포테이토(R)", selectedDrink: "제로슈거콜라" },
      ],
      totalPrice: 41800,
      discount: 2000,
      finalPrice: 39800,
      orderType: "dineIn",
    },
  },
];
