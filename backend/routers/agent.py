from fastapi import APIRouter
from models import ChatRequest, ChatResponse
from data_loader import menus, set_options, promotions, coupons
from utils import build_cart_response
from store import carts, orders

router = APIRouter(prefix="/agent", tags=["에이전트"])


@router.post("/chat", response_model=ChatResponse)
def agent_chat(req: ChatRequest):
    """
    FE에서 사용자 메시지를 받아 Agent에 전달하고,
    Agent가 생성한 A2UI JSON을 FE에 반환합니다.

    ※ 현재는 Mock 응답. 에이전트 팀이 Gemini 연동 시 교체.
    """
    msg = req.message
    sid = req.session_id

    # ──────────────────────────────────────
    # S-01 단체 주문 키워드
    # "6명", "단체", "세트 3개" 등
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["단체", "명이", "세트 3", "세트 2", "일괄"]):
        # 불고기 세트 3개 + 치킨버거 세트 2개를 장바구니에 추가
        import uuid

        if sid not in carts:
            carts[sid] = {}

        # 불고기 세트 3개
        for _ in range(3):
            cart_item_id = f"cart-{uuid.uuid4().hex[:8]}"
            carts[sid][cart_item_id] = {
                "menuId": "burger-001",
                "quantity": 1,
                "isSet": True,
                "selectedSide": "포테이토(R)",
                "selectedDrink": "제로슈거콜라",
                "drinkSize": "R",
                "toppings": [],
                "isModified": False,
            }

        # 치킨버거 세트 2개
        for _ in range(2):
            cart_item_id = f"cart-{uuid.uuid4().hex[:8]}"
            carts[sid][cart_item_id] = {
                "menuId": "burger-006",
                "quantity": 1,
                "isSet": True,
                "selectedSide": "포테이토(R)",
                "selectedDrink": "제로슈거콜라",
                "drinkSize": "R",
                "toppings": [],
                "isModified": False,
            }

        cart = build_cart_response(sid)
        return ChatResponse(
            reply="단체 주문을 구성했습니다! 리아 불고기 세트 3개, 치킨버거 세트 2개이며, 음료는 전부 제로슈거콜라로 설정했습니다.",
            components=[cart]
        )

    # ──────────────────────────────────────
    # S-03 세트 주문 (OptionSelector 반환)
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["세트 주문", "세트로", "세트 구성"]):
        menu = None
        for m in menus:
            if m["name"] in msg:
                menu = m
                break
        if not menu:
            menu = menus[0]

        if menu.get("setPrice") is None:
            return ChatResponse(
                reply=f"{menu['name']}은(는) 세트 구성이 불가능합니다.",
                components=None
            )

        option_selector = {
            "type": "OptionSelector",
            "menuId": menu["menuId"],
            "menuName": menu["name"],
            "menuPrice": menu["price"],
            "setPrice": menu["setPrice"],
        }
        return ChatResponse(
            reply=f"{menu['name']} 세트 구성을 선택해주세요!",
            components=[option_selector]
        )

    # ──────────────────────────────────────
    # S-02 칼로리 필터 추천
    # "칼로리", "저칼로리", "다이어트", "500 이하"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["칼로리", "저칼로리", "다이어트", "건강"]):
        result = [
            m for m in menus
            if m["calories"] <= 500 and m.get("setPrice") is not None
        ]
        components = [
            {
                "type": "MenuCard",
                "menuId": m["menuId"],
                "name": m["name"],
                "price": m["price"],
                "setPrice": m["setPrice"],
                "calories": m["calories"],
                "image": m["image"],
                "description": m["description"],
                "allergens": m["allergens"],
                "isNew": m["isNew"],
                "isBestSeller": m["isBestSeller"],
                "soldOut": m["soldOut"],
            }
            for m in result
        ]
        return ChatResponse(
            reply=f"칼로리 500 이하 세트 가능 메뉴 {len(result)}개를 찾았습니다!",
            components=components
        )

    # ──────────────────────────────────────
    # S-03 주문 수정
    # "바꿔", "변경", "수정"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["바꿔", "변경", "수정"]):
        cart_items = carts.get(sid, {})
        if not cart_items:
            return ChatResponse(
                reply="장바구니가 비어있어서 수정할 항목이 없습니다. 먼저 메뉴를 추가해주세요!",
                components=None
            )

        # 첫 번째 항목의 사이드를 치즈스틱으로, 음료를 칠성사이다로 변경
        first_item_id = list(cart_items.keys())[0]
        cart_items[first_item_id]["selectedSide"] = "치즈스틱"
        cart_items[first_item_id]["selectedDrink"] = "칠성사이다"
        cart_items[first_item_id]["isModified"] = True

        cart = build_cart_response(sid)
        return ChatResponse(
            reply="첫 번째 항목의 사이드를 치즈스틱으로, 음료를 칠성사이다로 변경했습니다. 변경된 항목이 하이라이트 표시됩니다.",
            components=[cart]
        )

    # ──────────────────────────────────────
    # S-04 알레르기 필터
    # "알레르기", "알러지", "견과류", "땅콩", "빼고"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["알레르기", "알러지", "견과류", "땅콩", "새우"]):
        # 기본적으로 땅콩 제외, 키워드에 따라 다르게
        exclude = []
        if "견과류" in msg or "땅콩" in msg:
            exclude = ["땅콩"]
        if "새우" in msg:
            exclude = ["새우"]
        if "우유" in msg:
            exclude = ["우유"]
        if not exclude:
            exclude = ["땅콩"]

        result = [
            m for m in menus
            if not any(a in m.get("allergens", []) for a in exclude)
        ]

        banner = {
            "type": "AllergyBanner",
            "allergens": exclude,
            "message": f"{', '.join(exclude)}이(가) 포함된 메뉴를 제외했습니다",
            "filteredCount": len(menus) - len(result)
        }

        menu_cards = [
            {
                "type": "MenuCard",
                "menuId": m["menuId"],
                "name": m["name"],
                "price": m["price"],
                "setPrice": m["setPrice"],
                "calories": m["calories"],
                "image": m["image"],
                "description": m["description"],
                "allergens": m["allergens"],
                "isNew": m["isNew"],
                "isBestSeller": m["isBestSeller"],
                "soldOut": m["soldOut"],
            }
            for m in result
        ]

        return ChatResponse(
            reply=f"{', '.join(exclude)} 알레르기를 제외한 안전한 메뉴 {len(result)}개입니다.",
            components=[banner] + menu_cards
        )

    # ──────────────────────────────────────
    # S-05 예산 기반 추천
    # "만원", "예산", "2만원", "가성비"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["예산", "만원", "가성비", "얼마"]):
        budget = 20000
        headcount = 3

        # 세트 가능 메뉴 중 저렴한 순으로 조합
        set_menus = sorted(
            [m for m in menus if m.get("setPrice") is not None],
            key=lambda x: x["setPrice"]
        )

        # 조합 A: 가장 저렴한 3개
        combo_a_items = set_menus[:3]
        combo_a_total = sum(m["setPrice"] for m in combo_a_items)

        # 조합 B: 베스트셀러 위주
        best_sellers = [m for m in set_menus if m["isBestSeller"]][:3]
        combo_b_total = sum(m["setPrice"] for m in best_sellers)

        combos = {
            "type": "ComboRecommendation",
            "budget": budget,
            "headcount": headcount,
            "combos": [
                {
                    "comboId": "combo-a",
                    "label": "조합 A (가성비)",
                    "items": [{"name": m["name"] + " 세트", "price": m["setPrice"]} for m in combo_a_items],
                    "totalPrice": combo_a_total,
                    "remaining": budget - combo_a_total
                },
                {
                    "comboId": "combo-b",
                    "label": "조합 B (인기 메뉴)",
                    "items": [{"name": m["name"] + " 세트", "price": m["setPrice"]} for m in best_sellers],
                    "totalPrice": combo_b_total,
                    "remaining": budget - combo_b_total
                }
            ]
        }

        return ChatResponse(
            reply=f"예산 {budget:,}원으로 {headcount}명이 먹을 수 있는 세트 조합 2가지를 추천합니다!",
            components=[combos]
        )

    # ──────────────────────────────────────
    # S-06 리오더
    # "지난번", "이전", "다시", "리오더", "또"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["지난번", "이전 주문", "다시 주문", "리오더", "저번"]):
        order_list = orders.get(sid, [])

        if not order_list:
            return ChatResponse(
                reply="이전 주문 내역이 없습니다. 먼저 주문을 해주세요!",
                components=None
            )

        order_history = {
            "type": "OrderHistory",
            "orders": [
                {
                    "orderId": o["orderId"],
                    "createdAt": o["createdAt"],
                    "items": [
                        {"name": item["name"], "quantity": item["quantity"]}
                        for item in o["items"]
                    ],
                    "totalPrice": o["totalPrice"],
                }
                for o in order_list
            ]
        }

        return ChatResponse(
            reply="이전 주문 내역입니다. 다시 주문하시겠습니까?",
            components=[order_history]
        )

    # ──────────────────────────────────────
    # S-07 메뉴 비교
    # "비교", "차이", "뭐가 달라"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["비교", "차이", "뭐가 달라", "어떤 게"]):
        # 기본적으로 리아 불고기 vs 데리버거 비교
        menu_a = next((m for m in menus if m["menuId"] == "burger-001"), None)
        menu_b = next((m for m in menus if m["menuId"] == "burger-002"), None)

        if menu_a and menu_b:
            comparison = {
                "type": "ComparisonTable",
                "menus": [
                    {
                        "menuId": m["menuId"],
                        "name": m["name"],
                        "image": m["image"],
                        "price": m["price"],
                        "calories": m["calories"],
                        "protein": m["nutrition"]["protein"],
                        "sodium": m["nutrition"]["sodium"],
                        "sugar": m["nutrition"]["sugar"],
                        "saturatedFat": m["nutrition"]["saturatedFat"],
                        "allergens": m["allergens"],
                    }
                    for m in [menu_a, menu_b]
                ]
            }
            return ChatResponse(
                reply=f"{menu_a['name']}과 {menu_b['name']}을 비교해드리겠습니다!",
                components=[comparison]
            )

    # ──────────────────────────────────────
    # S-08 다국어
    # 영어 입력 감지
    # ──────────────────────────────────────
    if any(kw in msg.lower() for kw in ["burger", "chicken", "want", "please", "order", "menu"]):
        result = [m for m in menus if m["category"] == "burger" and not m["soldOut"]][:4]
        components = [
            {
                "type": "MenuCard",
                "menuId": m["menuId"],
                "name": m["name"],
                "price": m["price"],
                "setPrice": m["setPrice"],
                "calories": m["calories"],
                "image": m["image"],
                "description": m["description"],
                "allergens": m["allergens"],
                "isNew": m["isNew"],
                "isBestSeller": m["isBestSeller"],
                "soldOut": m["soldOut"],
            }
            for m in result
        ]
        return ChatResponse(
            reply="Here are our burger options! Please select one to add to your cart.",
            components=components
        )

    # ──────────────────────────────────────
    # S-09 프로모션 / 할인 / 쿠폰
    # "할인", "프로모션", "쿠폰", "이벤트"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["할인", "프로모션", "쿠폰", "이벤트", "혜택"]):
        active_promos = [p for p in promotions if p["isActive"]]

        promo_banner = {
            "type": "PromotionBanner",
            "promotions": [
                {
                    "title": p["title"],
                    "description": p["description"],
                    "discountType": p["discountType"],
                    "discountValue": p["discountValue"],
                    "applicableCount": len(p["applicableMenuIds"])
                }
                for p in active_promos
            ]
        }

        # 프로모션 적용 메뉴들
        promo_menu_ids = set()
        for p in active_promos:
            promo_menu_ids.update(p["applicableMenuIds"])

        promo_menus = [m for m in menus if m["menuId"] in promo_menu_ids]
        menu_cards = [
            {
                "type": "MenuCard",
                "menuId": m["menuId"],
                "name": m["name"],
                "price": m["price"],
                "setPrice": m["setPrice"],
                "calories": m["calories"],
                "image": m["image"],
                "description": m["description"],
                "allergens": m["allergens"],
                "isNew": m["isNew"],
                "isBestSeller": m["isBestSeller"],
                "soldOut": m["soldOut"],
                "promotion": next(
                    (
                        {
                            "title": p["title"],
                            "originalPrice": m["price"],
                            "discountedPrice": (
                                int(m["price"] * (1 - p["discountValue"])) if p["discountType"] == "rate"
                                else m["price"] - p["discountValue"]
                            )
                        }
                        for p in active_promos
                        if m["menuId"] in p["applicableMenuIds"]
                    ),
                    None
                )
            }
            for m in promo_menus
        ]

        coupon_selector = {
            "type": "CouponSelector",
            "coupons": [
                {
                    "couponId": c["couponId"],
                    "title": c["title"],
                    "discountType": c["discountType"],
                    "discountValue": c["discountValue"],
                    "minOrderPrice": c["minOrderPrice"],
                    "expiresAt": c["expiresAt"],
                    "isApplicable": True
                }
                for c in coupons
            ],
            "selectedCouponId": None
        }

        return ChatResponse(
            reply=f"현재 진행 중인 프로모션 {len(active_promos)}개와 사용 가능한 쿠폰 {len(coupons)}개가 있습니다!",
            components=[promo_banner] + menu_cards + [coupon_selector]
        )

    # ──────────────────────────────────────
    # S-10 커스텀 버거
    # "커스텀", "빼줘", "추가해줘", "토핑", "빵"
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["커스텀", "빼줘", "추가해", "토핑", "빵", "피클"]):
        base_menu = next((m for m in menus if m["menuId"] == "burger-001"), None)

        if base_menu:
            custom_builder = {
                "type": "CustomBuilder",
                "baseMenu": {
                    "menuId": base_menu["menuId"],
                    "name": base_menu["name"],
                    "image": base_menu["image"],
                },
                "currentToppings": [
                    {"name": "양상추", "isOriginal": True, "isAdded": False, "isRemoved": False, "price": 0},
                    {"name": "토마토", "isOriginal": True, "isAdded": False, "isRemoved": False, "price": 0},
                    {"name": "피클", "isOriginal": True, "isAdded": False, "isRemoved": "피클" in msg, "price": 0},
                    {"name": "치즈토핑", "isOriginal": False, "isAdded": "치즈" in msg, "isRemoved": False, "price": 800},
                    {"name": "베이컨토핑", "isOriginal": False, "isAdded": "베이컨" in msg, "isRemoved": False, "price": 800},
                ],
                "additionalPrice": (800 if "치즈" in msg else 0) + (800 if "베이컨" in msg else 0)
            }

            return ChatResponse(
                reply="리아 불고기를 기반으로 커스텀 구성을 만들었습니다. 재료를 확인해주세요!",
                components=[custom_builder]
            )

    # ──────────────────────────────────────
    # 메뉴 / 추천 (일반)
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["메뉴", "추천", "뭐 있"]):
        result = menus[:6]
        components = [
            {
                "type": "MenuCard",
                "menuId": m["menuId"],
                "name": m["name"],
                "price": m["price"],
                "setPrice": m["setPrice"],
                "calories": m["calories"],
                "image": m["image"],
                "description": m["description"],
                "allergens": m["allergens"],
                "isNew": m["isNew"],
                "isBestSeller": m["isBestSeller"],
                "soldOut": m["soldOut"],
            }
            for m in result
        ]
        return ChatResponse(
            reply="인기 메뉴를 추천해드릴게요!",
            components=components
        )

    # ──────────────────────────────────────
    # 장바구니 조회
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["장바구니", "담은 거", "카트"]):
        cart = build_cart_response(sid)
        if cart["itemCount"] == 0:
            return ChatResponse(
                reply="장바구니가 비어있습니다. 메뉴를 추천해드릴까요?",
                components=None
            )
        return ChatResponse(
            reply="현재 장바구니 내역입니다.",
            components=[cart]
        )

    # ──────────────────────────────────────
    # 결제 / 주문 완료
    # ──────────────────────────────────────
    if any(kw in msg for kw in ["결제", "계산", "주문할게", "주문 완료"]):
        cart = build_cart_response(sid)
        if cart["itemCount"] == 0:
            return ChatResponse(
                reply="장바구니가 비어있습니다. 먼저 메뉴를 담아주세요!",
                components=None
            )

        payment = {
            "type": "PaymentSummary",
            "items": [
                {
                    "name": item["name"],
                    "quantity": item["quantity"],
                    "subtotal": item["subtotal"]
                }
                for item in cart["items"]
            ],
            "totalPrice": cart["totalPrice"],
            "discount": 0,
            "finalPrice": cart["totalPrice"],
            "orderType": "dineIn"
        }

        return ChatResponse(
            reply="주문 내역을 확인해주세요. 결제를 진행하시겠습니까?",
            components=[cart, payment]
        )

    # ──────────────────────────────────────
    # 기본 응답
    # ──────────────────────────────────────
    return ChatResponse(
        reply=f"'{msg}'에 대해 도움을 드리겠습니다. 아래와 같은 것들을 말씀해보세요!\n\n"
              "• 메뉴 추천해줘\n"
              "• 칼로리 낮은 메뉴 보여줘\n"
              "• 견과류 알레르기 있어\n"
              "• 2만원 예산으로 3명 추천\n"
              "• 메뉴 비교해줘\n"
              "• 할인 중인 메뉴 뭐 있어?\n"
              "• 피클 빼고 치즈 추가해줘\n"
              "• I want a burger please",
        components=None
    )
