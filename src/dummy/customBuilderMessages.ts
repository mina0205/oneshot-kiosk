import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-10: "불고기버거에서 피클 빼고 양상추 추가해줘"
export const customBuilderMessages: A2UIMessage[] = [
  {
    id: "s10-custom",
    type: "CustomBuilder",
    props: {
      baseMenu: {
        menuId: "burger-001",
        name: "리아 불고기",
        image: "/images/ria-bulgogi.png",
      },
      currentToppings: [
        { name: "불고기 패티", isOriginal: true, isAdded: false, isRemoved: false, price: 0 },
        { name: "양상추", isOriginal: true, isAdded: false, isRemoved: false, price: 0 },
        { name: "토마토", isOriginal: true, isAdded: false, isRemoved: false, price: 0 },
        { name: "피클", isOriginal: true, isAdded: false, isRemoved: true, price: 0 },
        { name: "치즈 토핑", isOriginal: false, isAdded: true, isRemoved: false, price: 800 },
        { name: "베이컨", isOriginal: false, isAdded: false, isRemoved: false, price: 1200 },
        { name: "반숙 계란", isOriginal: false, isAdded: false, isRemoved: false, price: 1000 },
      ],
      additionalPrice: 800,
    },
  },
];
