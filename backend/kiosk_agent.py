from typing import Dict, Any, List, Optional
from google import genai
import json
import os


class KioskAgent:
    def __init__(
        self,
        menus,
        set_options,
        carts_by_session,
        orders_by_session,
        promotions,
        coupons_by_session,
    ):
        self.menus = menus
        self.set_options = set_options
        self.carts_by_session = carts_by_session
        self.orders_by_session = orders_by_session
        self.promotions = promotions
        self.coupons_by_session = coupons_by_session
        self.client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

        self.system_prompt = """
너는 롯데리아 키오스크 주문 도우미다.

사용자의 발화를 아래 시나리오 중 하나로 분류해라.

가능한 scenario:
- S-06: 이전 주문 반복
- S-07: 메뉴 비교 분석
- S-08: 다국어 즉시 주문
- S-09: 프로모션·쿠폰 통합 안내
- S-10: 커스텀 조합 주문
- UNKNOWN

현재 사용 가능한 대표 메뉴:
- 리아 불고기
- 데리버거
- 한우불고기버거
- 핫크리스피치킨버거
- NEW 미라클버거
- 치킨버거
- 클래식치즈버거
- 리아 새우
- 리아 새우 베이컨

반드시 JSON만 출력해라.
코드블록 쓰지 마라.
설명하지 마라.

출력 형식:
{
  "scenario": "S-07",
  "params": {
    "menu_names": [],
    "items": [],
    "menu_name": null,
    "bun": null,
    "remove": [],
    "add": [],
    "language": "ko"
  }
}
"""

    # ----------------------------
    # Gemini 분석
    # ----------------------------
    def analyze_with_gemini(self, user_text: str) -> dict:
        prompt = f"""
{self.system_prompt}

사용자 발화:
{user_text}
"""
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
            )
            text = response.text.strip()
            text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)

        except Exception as e:
            print("Gemini 분석 오류:", e)
            return {
                "scenario": "UNKNOWN",
                "params": {
                    "menu_names": [],
                    "items": [],
                    "menu_name": None,
                    "bun": None,
                    "remove": [],
                    "add": [],
                    "language": "ko",
                },
            }

    # ----------------------------
    # 공통 유틸
    # ----------------------------
    def get_session_cart(self, session_id: str) -> List[Dict[str, Any]]:
        return self.carts_by_session.setdefault(session_id, [])

    def find_menu_by_id(self, menu_id: str) -> Optional[Dict[str, Any]]:
        return next((m for m in self.menus if m["menuId"] == menu_id), None)

    def find_menu_by_name(self, menu_name: str) -> Optional[Dict[str, Any]]:
        if not isinstance(menu_name, str):
            return None

        normalized = menu_name.lower().replace(" ", "")
        for menu in self.menus:
            if menu["name"].lower().replace(" ", "") == normalized:
                return menu
        return None

    def build_cart_summary(self, session_id: str) -> Dict[str, Any]:
        cart = self.get_session_cart(session_id)
        total_price = sum(item["subtotal"] for item in cart)
        total_calories = 0

        for item in cart:
            menu = self.find_menu_by_id(item["menuId"])
            if menu:
                total_calories += menu.get("calories", 0) * item["quantity"]

        return {
            "items": cart,
            "totalPrice": total_price,
            "totalCalories": total_calories,
            "itemCount": len(cart),
        }

    def make_menu_card(
        self,
        menu: Dict[str, Any],
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        card = {
            "type": "MenuCard",
            "menuId": menu["menuId"],
            "name": menu["name"],
            "price": menu.get("price"),
            "setPrice": menu.get("setPrice"),
            "calories": menu.get("calories"),
            "image": menu.get("image", ""),
            "description": menu.get("description", ""),
            "allergens": menu.get("allergens", []),
            "isNew": menu.get("isNew", False),
            "isBestSeller": menu.get("isBestSeller", False),
            "soldOut": menu.get("soldOut", False),
        }
        if extra:
            card.update(extra)
        return card

    def make_cart_component(self, session_id: str) -> Dict[str, Any]:
        cart_summary = self.build_cart_summary(session_id)
        return {
            "type": "Cart",
            "items": cart_summary["items"],
            "itemCount": cart_summary["itemCount"],
            "totalPrice": cart_summary["totalPrice"],
        }

    def make_payment_summary(
        self,
        session_id: str,
        discount_info: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        cart_summary = self.build_cart_summary(session_id)
        result = {
            "type": "PaymentSummary",
            "totalPrice": cart_summary["totalPrice"],
            "totalCalories": cart_summary["totalCalories"],
            "itemCount": cart_summary["itemCount"],
        }
        if discount_info:
            result["discount"] = discount_info
            result["finalPrice"] = max(
                0,
                cart_summary["totalPrice"] - discount_info.get("discountAmount", 0),
            )
        else:
            result["finalPrice"] = cart_summary["totalPrice"]
        return result

    def parse_quantity(self, text: str) -> int:
        lower = text.lower()
        if "three" in lower or "3개" in text or "세 개" in text or "세개" in text:
            return 3
        if "two" in lower or "2개" in text or "두 개" in text or "두개" in text:
            return 2
        return 1

    def parse_drink_size(self, text: str) -> str:
        lower = text.lower()
        if "large" in lower or "라지" in text or "큰" in text:
            return "L"
        return "R"

    def calculate_coupon_discount(self, total_price: int, coupon: Dict[str, Any]) -> int:
        if coupon["discountType"] == "percent":
            return int(total_price * coupon["discountValue"] / 100)
        if coupon["discountType"] == "amount":
            return int(coupon["discountValue"])
        return 0

    # ----------------------------
    # Tool 성격의 내부 함수
    # ----------------------------
    def tool_get_orders(self, session_id: str) -> List[Dict[str, Any]]:
        return self.orders_by_session.get(session_id, [])

    def tool_reorder(self, session_id: str, order_id: str) -> Dict[str, Any]:
        orders = self.orders_by_session.get(session_id, [])
        order = next((o for o in orders if o["orderId"] == order_id), None)
        if not order:
            return {"error": "주문 이력을 찾을 수 없습니다"}

        new_cart = []
        for item in order["items"]:
            cloned = dict(item)
            cloned["cartItemId"] = f"reorder-{len(new_cart) + 1}"
            new_cart.append(cloned)

        self.carts_by_session[session_id] = new_cart
        return {
            "message": "이전 주문이 장바구니에 복원되었습니다",
            "cart": self.build_cart_summary(session_id),
        }

    def tool_get_promotions(self) -> List[Dict[str, Any]]:
        return self.promotions

    def tool_get_coupons(self, session_id: str) -> List[Dict[str, Any]]:
        return self.coupons_by_session.get(session_id, [])

    def tool_get_toppings(self) -> List[Dict[str, Any]]:
        return self.set_options.get("toppings", [])

    def tool_add_to_cart(
        self,
        session_id: str,
        menu_id: str,
        quantity: int = 1,
        is_set: bool = False,
        toppings: Optional[List[str]] = None,
        selected_side: Optional[str] = None,
        selected_drink: Optional[str] = None,
        drink_size: str = "R",
    ) -> Dict[str, Any]:
        menu = self.find_menu_by_id(menu_id)
        if not menu:
            return {"error": "메뉴를 찾을 수 없습니다"}

        if menu.get("soldOut"):
            return {"error": "품절된 메뉴입니다"}

        cart = self.get_session_cart(session_id)
        base_price = menu["setPrice"] if is_set and menu.get("setPrice") else menu["price"]
        subtotal = base_price * quantity

        cart_item = {
            "cartItemId": f"cart-{len(cart) + 1}",
            "menuId": menu_id,
            "name": menu["name"],
            "isSet": is_set,
            "quantity": quantity,
            "unitPrice": base_price,
            "subtotal": subtotal,
            "selectedSide": selected_side,
            "selectedDrink": selected_drink,
            "drinkSize": drink_size,
            "toppings": toppings or [],
        }
        cart.append(cart_item)

        return {
            "message": "장바구니에 추가되었습니다",
            "cartItem": cart_item,
        }

    # ----------------------------
    # fallback 판별
    # ----------------------------
    def is_reorder_message(self, text: str) -> bool:
        keywords = ["지난번", "그대로 다시", "재주문", "repeat", "last order", "same order"]
        return any(k.lower() in text.lower() for k in keywords)

    def is_compare_message(self, text: str) -> bool:
        keywords = ["비교", "차이", "vs", "랑", "와"]
        return any(k.lower() in text.lower() for k in keywords)

    def is_promotion_message(self, text: str) -> bool:
        keywords = ["할인", "프로모션", "쿠폰", "이벤트"]
        return any(k in text for k in keywords)

    def is_custom_message(self, text: str) -> bool:
        keywords = ["빼고", "추가", "바꾸고", "바꿔", "통밀", "피클", "양상추"]
        return any(k in text for k in keywords)

    def is_english_order(self, text: str) -> bool:
        english_keywords = [
            "i want",
            "please",
            "cheese burger",
            "cheeseburger",
            "burger",
            "coke",
            "large",
            "small",
            "one",
            "two",
        ]
        return any(k in text.lower() for k in english_keywords)

    # ----------------------------
    # 시나리오 핸들러
    # ----------------------------
    def handle_reorder(self, session_id: str) -> Dict[str, Any]:
        orders = self.tool_get_orders(session_id)
        if not orders:
            return {
                "reply": "이전 주문 내역이 없어요.",
                "components": [],
            }

        latest_order = orders[-1]
        self.tool_reorder(session_id, latest_order["orderId"])

        order_history_component = {
            "type": "OrderHistory",
            "orders": orders,
        }

        return {
            "reply": "지난번 주문을 그대로 장바구니에 담아드렸어요.",
            "components": [
                order_history_component,
                self.make_cart_component(session_id),
                self.make_payment_summary(session_id),
            ],
        }

    def handle_compare(self, text: str, params: Dict[str, Any]) -> Dict[str, Any]:
        menu_names = params.get("menu_names", [])
        if not isinstance(menu_names, list):
            menu_names = []

        menus_to_compare = []
        for name in menu_names:
            if not isinstance(name, str):
                continue
            menu = self.find_menu_by_name(name)
            if menu:
                menus_to_compare.append(menu)

        if len(menus_to_compare) < 2:
            fallback_ids = ["burger-001", "burger-007"]
            menus_to_compare = [self.find_menu_by_id(mid) for mid in fallback_ids]
            reply = (
                "빅맥과 와퍼는 현재 키오스크 메뉴에 없어 직접 비교는 어렵습니다. "
                "대신 현재 제공 중인 대표 버거인 리아 불고기와 클래식치즈버거를 비교해드릴게요."
            )
        else:
            reply = "요청하신 메뉴를 비교해드릴게요."

        comparison_rows = []
        for menu in menus_to_compare:
            if not menu:
                continue
            comparison_rows.append(
                {
                    "menuId": menu["menuId"],
                    "name": menu["name"],
                    "price": menu["price"],
                    "setPrice": menu.get("setPrice"),
                    "calories": menu.get("calories"),
                    "description": menu.get("description", ""),
                }
            )

        comparison_component = {
            "type": "ComparisonTable",
            "items": comparison_rows,
        }

        cards = [self.make_menu_card(menu) for menu in menus_to_compare if menu]

        return {
            "reply": reply,
            "components": [comparison_component] + cards,
        }

    def handle_multilingual_order(
        self,
        session_id: str,
        text: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        items = params.get("items", [])
        added_cards = []

        if not isinstance(items, list):
            items = []

        # 1. Gemini가 구조화 잘 해준 경우
        if items:
            for item in items:
                if not isinstance(item, dict):
                    continue

                menu_name = item.get("menu_name", "")
                quantity = item.get("quantity", 1)

                if not isinstance(menu_name, str):
                    continue

                if not isinstance(quantity, int):
                    quantity = 1

                matched_menu = self.find_menu_by_name(menu_name)

                # 영어 메뉴명 최소 매핑
                if not matched_menu:
                    lower_name = menu_name.lower().replace(" ", "")
                    if "cheeseburger" in lower_name or "cheeseburger" in lower_name:
                        matched_menu = self.find_menu_by_id("burger-007")

                if matched_menu:
                    self.tool_add_to_cart(
                        session_id=session_id,
                        menu_id=matched_menu["menuId"],
                        quantity=quantity,
                        is_set=False,
                    )
                    added_cards.append(self.make_menu_card(matched_menu))

        # 2. Gemini 구조화가 애매하면 문장 자체에서 fallback 파싱
        if not added_cards:
            lower = text.lower()
            quantity = self.parse_quantity(text)

            if "cheese burger" in lower or "cheeseburger" in lower:
                menu = self.find_menu_by_id("burger-007")
                if menu:
                    self.tool_add_to_cart(
                        session_id=session_id,
                        menu_id="burger-007",
                        quantity=quantity,
                        is_set=False,
                    )
                    added_cards.append(self.make_menu_card(menu))

        # 3. 그래도 아무것도 못 찾으면 안전 응답
        if not added_cards:
            return {
                "reply": "I understood your request, but I could not match the menu exactly.",
                "components": [],
            }

        return {
            "reply": "I added your order to the cart.",
            "components": added_cards
            + [
                self.make_cart_component(session_id),
                self.make_payment_summary(session_id),
            ],
        }

    def handle_promotion(self, session_id: str) -> Dict[str, Any]:
        promo_cards = []
        for promo in self.tool_get_promotions():
            menu = self.find_menu_by_id(promo["menuId"])
            if not menu:
                continue

            discount_price = max(0, menu["price"] - promo["discountAmount"])
            promo_cards.append(
                self.make_menu_card(
                    menu,
                    extra={
                        "promotionTitle": promo["title"],
                        "originalPrice": menu["price"],
                        "discountedPrice": discount_price,
                    },
                )
            )

        coupons = self.tool_get_coupons(session_id)

        coupon_selector = {
            "type": "CouponSelector",
            "coupons": coupons,
        }

        promotion_banner = {
            "type": "PromotionBanner",
            "title": "현재 적용 가능한 할인 혜택",
            "description": "프로모션과 쿠폰을 함께 확인해보세요.",
        }

        cart_total = self.build_cart_summary(session_id)["totalPrice"]
        discount_info = None

        if coupons and cart_total > 0:
            best_coupon = max(
                coupons,
                key=lambda c: self.calculate_coupon_discount(cart_total, c),
            )
            discount_info = {
                "couponId": best_coupon["couponId"],
                "couponName": best_coupon["name"],
                "discountAmount": self.calculate_coupon_discount(cart_total, best_coupon),
            }

        components = [promotion_banner] + promo_cards + [coupon_selector]

        if cart_total > 0:
            components.append(self.make_payment_summary(session_id, discount_info))

        return {
            "reply": "현재 할인 중인 메뉴와 적용 가능한 쿠폰을 보여드릴게요.",
            "components": components,
        }

    def handle_custom(
        self,
        session_id: str,
        text: str,
        params: Dict[str, Any],
    ) -> Dict[str, Any]:
        menu_name = params.get("menu_name")
        bun = params.get("bun")
        remove_list = params.get("remove", [])
        add_list = params.get("add", [])

        if not isinstance(remove_list, list):
            remove_list = []
        if not isinstance(add_list, list):
            add_list = []

        base_menu = None
        if menu_name:
            base_menu = self.find_menu_by_name(menu_name)

        if not base_menu:
            if "불고기" in text:
                base_menu = self.find_menu_by_id("burger-001")
            elif "치즈" in text:
                base_menu = self.find_menu_by_id("burger-007")

        if not base_menu:
            return {
                "reply": "어떤 버거를 기준으로 커스텀할지 찾지 못했어요.",
                "components": [],
            }

        changes = {
            "bun": bun,
            "remove": remove_list,
            "add": add_list,
        }

        if not bun and "통밀" in text:
            changes["bun"] = "통밀"
        if not remove_list and "피클" in text and ("빼" in text or "제외" in text):
            changes["remove"].append("피클")
        if not add_list and "양상추" in text and "추가" in text:
            changes["add"].append("양상추")

        custom_builder = {
            "type": "CustomBuilder",
            "menuId": base_menu["menuId"],
            "baseMenu": base_menu["name"],
            "changes": changes,
            "availableToppings": self.tool_get_toppings(),
        }

        summary_card = self.make_menu_card(
            base_menu,
            extra={"customSummary": changes},
        )

        self.tool_add_to_cart(
            session_id=session_id,
            menu_id=base_menu["menuId"],
            quantity=1,
            is_set=False,
            toppings=changes["add"],
        )

        return {
            "reply": "요청하신 대로 커스텀 구성을 만들어봤어요.",
            "components": [
                custom_builder,
                summary_card,
                self.make_cart_component(session_id),
            ],
        }

    # ----------------------------
    # 메인 실행 진입점
    # ----------------------------
    def run(self, session_id: str, message: str) -> Dict[str, Any]:
        result = self.analyze_with_gemini(message)
        scenario = result.get("scenario", "UNKNOWN")
        params = result.get("params", {})

        if not isinstance(params, dict):
            params = {}

        print("Gemini result:", result)

        if scenario == "S-06":
            return self.handle_reorder(session_id)

        if scenario == "S-07":
            return self.handle_compare(message, params)

        if scenario == "S-08":
            return self.handle_multilingual_order(session_id, message, params)

        if scenario == "S-09":
            return self.handle_promotion(session_id)

        if scenario == "S-10":
            return self.handle_custom(session_id, message, params)

        # fallback
        if self.is_reorder_message(message):
            return self.handle_reorder(session_id)

        if self.is_promotion_message(message):
            return self.handle_promotion(session_id)

        if self.is_custom_message(message):
            return self.handle_custom(session_id, message, {})

        if self.is_english_order(message):
            return self.handle_multilingual_order(session_id, message, {})

        if self.is_compare_message(message):
            return self.handle_compare(message, {})

        return {
            "reply": "아직 해당 요청은 처리하지 못했어요. 다른 방식으로 말씀해 주세요.",
            "components": [],
        }