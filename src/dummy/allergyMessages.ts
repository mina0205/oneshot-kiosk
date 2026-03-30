import { A2UIMessage } from "@/components/a2ui/A2UIRenderer";

// S-04: "땅콩 알레르기 있어서 빼고 보여줘"
export const allergyMessages: A2UIMessage[] = [
  {
    id: "s04-banner",
    type: "AllergyBanner",
    props: {
      allergens: ["땅콩"],
      message: "땅콩이 포함된 메뉴 1개를 제외했습니다",
      filteredCount: 1,
    },
  },
  {
    id: "s04-menu-1",
    type: "MenuCard",
    props: {
      menuId: "burger-001",
      name: "리아 불고기",
      price: 5800,
      setPrice: 8600,
      calories: 462,
      image: "/images/ria-bulgogi.png",
      description: "달콤한 불고기 소스와 신선한 야채의 조화",
      allergens: ["밀", "대두", "달걀", "우유", "쇠고기"],
      isNew: false,
      isBestSeller: true,
      soldOut: false,
    },
  },
  {
    id: "s04-menu-2",
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
];
