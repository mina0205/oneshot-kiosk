// [Cell 1]: src/types/kiosk.ts
// 키오스크 전역에서 사용될 데이터 타입(인터페이스) 정의

export type Category = "burger" | "chicken" | "side" | "drink" | "iceshot";

export interface Nutrition {
  weight: number;
  calories: number;
  protein: number;
  sodium: number;
  sugar: number;
  saturatedFat: number;
  caffeine?: number;
}

export interface MenuItem {
  menuId: string;
  name: string;
  category: Category;
  price: number;
  setPrice: number | null;
  calories: number;
  description: string;
  image: string;
  allergens: string[];
  isNew: boolean;
  isBestSeller: boolean;
  soldOut: boolean;
  nutrition: Nutrition;
}

export interface SideOption {
  menuId: string;
  name: string;
  priceDiff: number;
  image: string;
}

export interface DrinkOption {
  menuId: string;
  name: string;
  size: "R" | "L";
  priceDiff: number;
  image: string;
}

export interface ToppingOption {
  toppingId: string;
  name: string;
  price: number;
  calories: number;
  allergens: string[];
}

export interface SetOptionCatalog {
  sides: SideOption[];
  drinks: DrinkOption[];
  toppings: ToppingOption[];
}

export interface CartItem {
  cartItemId: string; // 장바구니 항목 고유 ID (같은 버거라도 세트/단품 여부가 다르면 ID가 다름)
  menuId: string;
  name: string;
  isSet: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedSide?: string;
  selectedDrink?: string;
  drinkSize?: "R" | "L";
  toppings?: string[];
}