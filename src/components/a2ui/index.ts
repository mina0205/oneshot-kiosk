import { MenuCard } from "./MenuCard";
import { OptionSelector } from "./OptionSelector";
import { CartView } from "./CartView";
import { PaymentSummary } from "./PaymentSummary";
import { AllergyBanner } from "./AllergyBanner";
import { OrderComplete } from "./OrderComplete";
import { ComparisonTable } from "./ComparisonTable";
import { ComboRecommendation } from "./ComboRecommendation";
import { OrderHistory } from "./OrderHistory";
import { PromotionBanner } from "./PromotionBanner";
import { CouponSelector } from "./CouponSelector";
import { CustomBuilder } from "./CustomBuilder";

export const A2UI_COMPONENT_MAP = {
  MenuCard: MenuCard,
  OptionSelector: OptionSelector,
  Cart: CartView,
  PaymentSummary: PaymentSummary,
  AllergyBanner: AllergyBanner,
  OrderComplete: OrderComplete,
  ComparisonTable: ComparisonTable,
  ComboRecommendation: ComboRecommendation,
  OrderHistory: OrderHistory,
  PromotionBanner: PromotionBanner,
  CouponSelector: CouponSelector,
  CustomBuilder: CustomBuilder,
} as const;

export type A2UIComponentType = keyof typeof A2UI_COMPONENT_MAP;
