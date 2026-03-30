import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-03: "리아 불고기 세트 주문할게"
export const optionSelectorMessages: A2UIMessage[] = [
  {
    id: "s03-option",
    type: "OptionSelector",
    props: {
      menuId: "burger-001",
      menuName: "리아 불고기",
      menuPrice: 5800,
      setPrice: 8600,
    },
  },
];
