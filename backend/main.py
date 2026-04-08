from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("menu_data.json", "r", encoding="utf-8") as f:
    menus = json.load(f)

with open("set_options.json", "r", encoding="utf-8") as f:
    set_options = json.load(f)

with open("promotions.json", "r", encoding="utf-8") as f:
    promotions = json.load(f)

with open("coupons.json", "r", encoding="utf-8") as f:
    coupons = json.load(f)


# ══════════════════════════════════════
# 메뉴 API 
# ══════════════════════════════════════

@app.get("/menus")
def get_menus():
    return menus


@app.get("/menus/search")
def search_menus(
    maxCalories: Optional[int] = None,
    category: Optional[str] = None,
    excludeAllergens: Optional[str] = None,  # 쉼표 구분: "땅콩,우유"
):
    result = menus

    # 카테고리 필터
    if category:
        result = [m for m in result if m.get("category") == category]

    # 칼로리 필터
    if maxCalories is not None:
        result = [m for m in result if m["calories"] <= maxCalories]

    # 알레르기 필터 (해당 알레르겐 포함 메뉴 제외)
    if excludeAllergens:
        exclude_list = [a.strip() for a in excludeAllergens.split(",")]
        result = [
            m for m in result
            if not any(allergen in m.get("allergens", []) for allergen in exclude_list)
        ]

    return result


@app.get("/menus/{menuId}")
def get_menu(menuId: str):
    for menu in menus:
        if menu["menuId"] == menuId:
            return menu
    raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")

# ══════════════════════════════════════
# 세트 옵션 API (신규)
# ══════════════════════════════════════

@app.get("/set-options")
def get_set_options():
    """세트 옵션 전체 조회 (사이드 + 음료 + 토핑)"""
    return set_options


@app.get("/set-options/sides")
def get_sides():
    """사이드 옵션 목록"""
    return set_options["sides"]


@app.get("/set-options/drinks")
def get_drinks():
    """음료 옵션 목록"""
    return set_options["drinks"]


@app.get("/set-options/toppings")
def get_toppings():
    """토핑 옵션 목록"""
    return set_options["toppings"]


# ══════════════════════════════════════
# 프로모션 API (신규)
# ══════════════════════════════════════

@app.get("/promotions")
def get_promotions(activeOnly: Optional[bool] = True):
    """활성 프로모션 조회"""
    if activeOnly:
        return [p for p in promotions if p["isActive"]]
    return promotions


@app.get("/promotions/{menuId}")
def get_promotions_for_menu(menuId: str):
    """특정 메뉴에 적용 가능한 프로모션 조회"""
    result = [
        p for p in promotions
        if p["isActive"] and menuId in p.get("applicableMenuIds", [])
    ]
    return result

# ══════════════════════════════════════
# 쿠폰 API (신규)
# ══════════════════════════════════════

@app.get("/coupons")
def get_coupons(session_id: Optional[str] = None):
    """사용 가능한 쿠폰 목록 조회"""
    result = []
    
    # 현재 장바구니 총액 (적용 가능 여부 판단용)
    total_price = 0
    if session_id and session_id in carts:
        cart_response = build_cart_response(session_id)
        total_price = cart_response["totalPrice"]

    for c in coupons:
        result.append({
            **c,
            "isApplicable": total_price >= c["minOrderPrice"] if session_id else True
        })

    return {
        "type": "CouponSelector",
        "coupons": result,
        "selectedCouponId": None
    }


# ══════════════════════════════════════
# 데이터 모델 (Pydantic)
# ══════════════════════════════════════

class CartItemRequest(BaseModel):
    menuId: str
    quantity: int = 1
    isSet: bool = False
    selectedSide: Optional[str] = None   # "포테이토(R)"
    selectedDrink: Optional[str] = None  # "제로슈거콜라(R)"
    drinkSize: Optional[str] = None      # "R" | "L"
    toppings: Optional[List[str]] = None # ["치즈토핑"]

class CartItemUpdateRequest(BaseModel):
    quantity: Optional[int] = None
    selectedSide: Optional[str] = None
    selectedDrink: Optional[str] = None
    drinkSize: Optional[str] = None
    toppings: Optional[List[str]] = None

class OrderRequest(BaseModel):
    orderType: str = "dineIn"  # "dineIn" | "takeOut"
    couponId: Optional[str] = None


# ══════════════════════════════════════
# 인메모리 저장소
# ══════════════════════════════════════

# 장바구니: { session_id: { cartItemId: { ...item } } }
carts: dict = {}

# 주문 이력: { session_id: [ { ...order } ] }
orders: dict = {}

# 대기번호 카운터
order_counter = 0


# ══════════════════════════════════════
# 유틸 함수: API 엔드포인트가 호출됐을 때 내부에서 쓰이는 함수
# ══════════════════════════════════════

def find_menu(menu_id: str):
    """menuId로 메뉴 찾기"""
    for m in menus:
        if m["menuId"] == menu_id:
            return m
    return None


def find_set_option(option_type: str, name: str):
    """세트옵션에서 이름으로 찾기 (side/drink)"""
    options = set_options.get(f"{option_type}s", [])
    for opt in options:
        if opt["name"] == name:
            return opt
    return None


def find_topping(name: str):
    """토핑 이름으로 찾기"""
    for t in set_options["toppings"]:
        if t["name"] == name:
            return t
    return None


def calculate_unit_price(menu, item_data: dict) -> int:
    """장바구니 항목 1개의 단가 계산"""
    if item_data.get("isSet") and menu.get("setPrice"):
        base = menu["setPrice"]
    else:
        base = menu["price"]

    # 사이드 추가금
    if item_data.get("selectedSide"):
        side = find_set_option("side", item_data["selectedSide"])
        if side:
            base += side["priceDiff"]

    # 음료 추가금
    if item_data.get("selectedDrink"):
        drink_name = item_data["selectedDrink"]
        size = item_data.get("drinkSize", "R")
        for d in set_options["drinks"]:
            if d["name"] == drink_name and d["size"] == size:
                base += d["priceDiff"]
                break

    # 토핑 추가금
    if item_data.get("toppings"):
        for topping_name in item_data["toppings"]:
            topping = find_topping(topping_name)
            if topping:
                base += topping["price"]

    return base


def build_cart_response(session_id: str) -> dict:
    """세션의 장바구니를 Cart 컴포넌트 스키마에 맞게 변환"""
    cart_items = carts.get(session_id, {})

    items = []
    total_price = 0
    total_calories = 0
    item_count = 0

    for cart_item_id, item in cart_items.items():
        menu = find_menu(item["menuId"])
        if not menu:
            continue

        unit_price = calculate_unit_price(menu, item)
        subtotal = unit_price * item["quantity"]

        # 칼로리 계산 (토핑 포함)
        cal = menu["calories"]
        if item.get("toppings"):
            for t_name in item["toppings"]:
                t = find_topping(t_name)
                if t:
                    cal += t["calories"]

        items.append({
            "cartItemId": cart_item_id,
            "menuId": item["menuId"],
            "name": menu["name"] + (" 세트" if item.get("isSet") else ""),
            "quantity": item["quantity"],
            "unitPrice": unit_price,
            "subtotal": subtotal,
            "isSet": item.get("isSet", False),
            "selectedSide": item.get("selectedSide"),
            "selectedDrink": item.get("selectedDrink"),
            "drinkSize": item.get("drinkSize"),
            "toppings": item.get("toppings", []),
            "isModified": item.get("isModified", False),
        })

        total_price += subtotal
        total_calories += cal * item["quantity"]
        item_count += item["quantity"]

    return {
        "type": "Cart",
        "items": items,
        "totalPrice": total_price,
        "totalCalories": total_calories,
        "itemCount": item_count,
    }


# ══════════════════════════════════════
# 장바구니 API
# ══════════════════════════════════════

@app.get("/cart/{session_id}")
def get_cart(session_id: str):
    """장바구니 조회"""
    return build_cart_response(session_id)


@app.post("/cart/{session_id}/items")
def add_to_cart(session_id: str, item: CartItemRequest):
    """장바구니에 항목 추가"""
    # 메뉴 존재 확인
    menu = find_menu(item.menuId)
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")

    if menu.get("soldOut"):
        raise HTTPException(status_code=400, detail="품절된 메뉴입니다")

    # 세트인데 setPrice가 없는 메뉴
    if item.isSet and menu.get("setPrice") is None:
        raise HTTPException(status_code=400, detail="세트 구성이 불가능한 메뉴입니다")

    # 세션 장바구니 초기화
    if session_id not in carts:
        carts[session_id] = {}

    cart_item_id = f"cart-{uuid.uuid4().hex[:8]}"

    carts[session_id][cart_item_id] = {
        "menuId": item.menuId,
        "quantity": item.quantity,
        "isSet": item.isSet,
        "selectedSide": item.selectedSide,
        "selectedDrink": item.selectedDrink,
        "drinkSize": item.drinkSize,
        "toppings": item.toppings or [],
        "isModified": False,
    }

    return build_cart_response(session_id)


@app.patch("/cart/{session_id}/items/{cartItemId}")
def update_cart_item(session_id: str, cartItemId: str, update: CartItemUpdateRequest):
    """장바구니 항목 수정 (S-03 시나리오)"""
    if session_id not in carts or cartItemId not in carts[session_id]:
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다")

    item = carts[session_id][cartItemId]

    if update.quantity is not None:
        item["quantity"] = update.quantity
    if update.selectedSide is not None:
        item["selectedSide"] = update.selectedSide
    if update.selectedDrink is not None:
        item["selectedDrink"] = update.selectedDrink
    if update.drinkSize is not None:
        item["drinkSize"] = update.drinkSize
    if update.toppings is not None:
        item["toppings"] = update.toppings

    # 수정됨 표시 (하이라이트용)
    item["isModified"] = True

    return build_cart_response(session_id)


@app.delete("/cart/{session_id}/items/{cartItemId}")
def remove_cart_item(session_id: str, cartItemId: str):
    """장바구니에서 항목 삭제"""
    if session_id not in carts or cartItemId not in carts[session_id]:
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다")

    del carts[session_id][cartItemId]
    return build_cart_response(session_id)


@app.delete("/cart/{session_id}")
def clear_cart(session_id: str):
    """장바구니 전체 비우기"""
    carts[session_id] = {}
    return build_cart_response(session_id)


# ══════════════════════════════════════
# 주문 API
# ══════════════════════════════════════

@app.post("/orders/{session_id}")
def create_order(session_id: str, req: OrderRequest):
    """장바구니 → 주문 생성 (결제 완료)"""
    global order_counter

    cart = carts.get(session_id, {})
    if not cart:
        raise HTTPException(status_code=400, detail="장바구니가 비어있습니다")

    # 장바구니 응답 형태로 변환
    cart_response = build_cart_response(session_id)

    # 할인 계산
    discount = 0
    if req.couponId:
        # 간단한 쿠폰 처리 (추후 확장 가능)
        discount = 2000  # 임시 고정값

    # 프로모션 할인 계산
    promo_discount = 0
    for item in cart_response["items"]:
        menu_promos = [
            p for p in promotions
            if p["isActive"] and item["menuId"] in p.get("applicableMenuIds", [])
        ]
        for promo in menu_promos:
            if promo["discountType"] == "rate":
                promo_discount += int(item["unitPrice"] * promo["discountValue"]) * item["quantity"]
            elif promo["discountType"] == "amount":
                promo_discount += promo["discountValue"] * item["quantity"]

    total_discount = discount + promo_discount
    final_price = max(0, cart_response["totalPrice"] - total_discount)

    order_counter += 1

    order = {
        "orderId": f"ORD-{datetime.now().strftime('%Y%m%d')}-{order_counter:03d}",
        "items": cart_response["items"],
        "totalPrice": cart_response["totalPrice"],
        "discount": total_discount,
        "finalPrice": final_price,
        "orderType": req.orderType,
        "orderNumber": order_counter,
        "estimatedTime": max(5, len(cart_response["items"]) * 2),
        "createdAt": datetime.now().isoformat(),
    }

    # 주문 이력에 저장
    if session_id not in orders:
        orders[session_id] = []
    orders[session_id].append(order)

    # 장바구니 비우기
    carts[session_id] = {}

    # OrderComplete 컴포넌트 스키마에 맞춰 반환
    return {
        "type": "OrderComplete",
        "orderId": order["orderId"],
        "orderNumber": order["orderNumber"],
        "estimatedTime": order["estimatedTime"],
        "finalPrice": order["finalPrice"],
        "orderType": order["orderType"],
    }


@app.get("/orders/{session_id}")
def get_orders(session_id: str):
    """주문 이력 조회 (S-06 리오더 시나리오)"""
    order_list = orders.get(session_id, [])

    # OrderHistory 컴포넌트 스키마에 맞춰 반환
    return {
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


@app.post("/orders/{session_id}/reorder/{orderId}")
def reorder(session_id: str, orderId: str):
    """이전 주문 복원 → 장바구니에 담기 (S-06 리오더)"""
    order_list = orders.get(session_id, [])

    target_order = None
    for o in order_list:
        if o["orderId"] == orderId:
            target_order = o
            break

    if not target_order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")

    # 장바구니 초기화 후 이전 주문 항목 복원
    carts[session_id] = {}

    for item in target_order["items"]:
        cart_item_id = f"cart-{uuid.uuid4().hex[:8]}"
        carts[session_id][cart_item_id] = {
            "menuId": item["menuId"],
            "quantity": item["quantity"],
            "isSet": item.get("isSet", False),
            "selectedSide": item.get("selectedSide"),
            "selectedDrink": item.get("selectedDrink"),
            "drinkSize": item.get("drinkSize"),
            "toppings": item.get("toppings", []),
            "isModified": False,
        }

    return build_cart_response(session_id)

# ══════════════════════════════════════
# Agent Chat 엔드포인트 (FE ↔ Agent 중계)
# ══════════════════════════════════════

class ChatRequest(BaseModel):
    session_id: str
    message: str
    conversation_history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    reply: Optional[str] = None          # 에이전트의 텍스트 응답
    components: Optional[List[dict]] = None  # A2UI JSON 컴포넌트 배열

@app.post("/agent/chat", response_model=ChatResponse)
def agent_chat(req: ChatRequest):
    user_message = req.message

    # "메뉴" 키워드가 포함되면 메뉴 카드 반환
    if "메뉴" in user_message or "추천" in user_message:
        # search_menus 직접 호출 대신, menus 리스트에서 직접 필터
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
            reply="칼로리 500 이하 세트 가능 메뉴를 추천해드릴게요!",
            components=components
        )

    if "장바구니" in user_message:
        cart = build_cart_response(req.session_id)
        return ChatResponse(
            reply="현재 장바구니 내역입니다.",
            components=[cart]
        )

    if "주문" in user_message:
        return ChatResponse(
            reply="주문을 도와드릴게요. 어떤 메뉴를 원하시나요?",
            components=None
        )

    return ChatResponse(
        reply=f"'{user_message}'에 대해 도움을 드리겠습니다. 메뉴 추천, 장바구니 확인, 주문 등을 말씀해주세요!",
        components=None
    )
