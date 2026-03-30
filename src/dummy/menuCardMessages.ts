import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-02: "칼로리 500 이하 버거 추천해줘"
export const menuCardMessages: A2UIMessage[] = [
  {
    id: "s02-menu-1",
    type: "MenuCard",
    props: {
      menuId: "burger-002",
      name: "데리버거",
      price: 4500,
      setPrice: 7400,
      calories: 348,
      image: "/images/deri-burger.png",
      description: "부드러운 데리야끼 소스의 클래식 버거",
      allergens: ["달걀", "밀", "대두", "우유", "쇠고기"],
      isNew: false,
      isBestSeller: true,
      soldOut: false,
    },
  },
  {
    id: "s02-menu-2",
    type: "MenuCard",
    props: {
      menuId: "burger-006",
      name: "치킨버거",
      price: 5100,
      setPrice: 8000,
      calories: 355,
      image: "/images/chicken-burger.png",
      description: "담백한 치킨 패티의 가성비 버거",
      allergens: ["달걀", "밀", "대두", "닭고기", "땅콩"],
      isNew: false,
      isBestSeller: false,
      soldOut: false,
    },
  },
  {
    id: "s02-menu-3",
    type: "MenuCard",
    props: {
      menuId: "burger-005",
      name: "NEW 미라클버거",
      price: 6500,
      setPrice: 9200,
      calories: 382,
      image: "/images/miracle-burger.png",
      description: "식물성 패티로 만든 새로운 맛의 버거",
      allergens: ["밀", "대두", "토마토"],
      isNew: true,
      isBestSeller: false,
      soldOut: false,
    },
  },
];
