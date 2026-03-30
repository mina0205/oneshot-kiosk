// [Cell 1]: src/components/a2ui/index.ts
// 에이전트가 보낼 'type' 문자열과 실제 React 컴포넌트를 매핑합니다.

import { MenuCard } from './MenuCard';
import { OptionSelector } from './OptionSelector';
import { CartView } from './CartView';

export const A2UI_COMPONENT_MAP = {
  'MENU_CARD': MenuCard,
  'OPTION_SELECTOR': OptionSelector,
  'CART_VIEW': CartView,
} as const;

export type A2UIComponentType = keyof typeof A2UI_COMPONENT_MAP;