import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-07: "리아 불고기랑 데리버거 비교해줘"
export const comparisonMessages: A2UIMessage[] = [
  {
    id: "s07-compare",
    type: "ComparisonTable",
    props: {
      menus: [
        {
          menuId: "burger-001",
          name: "리아 불고기",
          image: "/images/ria-bulgogi.png",
          price: 5800,
          calories: 462,
          protein: 21,
          sodium: 880,
          sugar: 11,
          saturatedFat: 11,
          allergens: ["밀", "대두", "달걀", "우유", "쇠고기"],
        },
        {
          menuId: "burger-002",
          name: "데리버거",
          image: "/images/deri-burger.png",
          price: 4500,
          calories: 348,
          protein: 12,
          sodium: 590,
          sugar: 10,
          saturatedFat: 4.9,
          allergens: ["달걀", "밀", "대두", "우유", "쇠고기"],
        },
      ],
    },
  },
];
