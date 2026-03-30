import { MenuCard } from './MenuCard';
import { OptionSelector } from './OptionSelector';
import { CartView } from './CartView';
import { PaymentSummary } from './PaymentSummary';
import { AllergyBanner } from "./AllergyBanner";
import { OrderComplete } from "./OrderComplete";


export const A2UI_COMPONENT_MAP = {
  'MenuCard': MenuCard,           // 변경: MENU_CARD → MenuCard
  'OptionSelector': OptionSelector, // 변경: OPTION_SELECTOR → OptionSelector
  'Cart': CartView,           // 변경: CART_VIEW → CartView
  'PaymentSummary': PaymentSummary, // 추가: PaymentSummary
  'AllergyBanner': AllergyBanner,
  'OrderComplete': OrderComplete,
} as const;

export type A2UIComponentType = keyof typeof A2UI_COMPONENT_MAP;
