from kiosk_agent import KioskAgent
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from copy import deepcopy
import json
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

with open("menu_data.json", "r", encoding="utf-8") as f:
    menus = json.load(f)

with open("set_options.json", "r", encoding="utf-8") as f:
    set_options = json.load(f)

# ----------------------------
# 메모리 저장소
# ----------------------------
carts_by_session: Dict[str, List[Dict[str, Any]]] = {}

orders_by_session: Dict[str, List[Dict[str, Any]]] = {
    "test-user": [
        {
            "orderId": "order-001",
            "items": [
                {
                    "cartItemId": "prev-1",
                    "menuId": "burger-001",
                    "name": "리아 불고기",
                    "isSet": True,
                    "quantity": 1,
                    "unitPrice": 8600,
                    "subtotal": 8600,
                    "selectedSide": "포테이토(R)",
                    "selectedDrink": "제로슈거콜라",
                    "drinkSize": "R",
                    "toppings": []
                },
                {
                    "cartItemId": "prev-2",
                    "menuId": "burger-007",
                    "name": "클래식치즈버거",
                    "isSet": False,
                    "quantity": 1,
                    "unitPrice": 6300,
                    "subtotal": 6300,
                    "selectedSide": None,
                    "selectedDrink": None,
                    "drinkSize": "R",
                    "toppings": []
                }
            ],
            "totalPrice": 14900,
            "orderedAt": "2026-04-12T12:00:00"
        }
    ]
}

promotions = [
    {
        "promotionId": "promo-001",
        "menuId": "burger-001",
        "title": "리아 불고기 1,000원 할인",
        "discountAmount": 1000,
        "description": "이번 주 한정 할인"
    },
    {
        "promotionId": "promo-002",
        "menuId": "burger-007",
        "title": "클래식치즈버거 800원 할인",
        "discountAmount": 800,
        "description": "인기 메뉴 프로모션"
    }
]

coupons_by_session = {
    "test-user": [
        {
            "couponId": "coupon-001",
            "name": "10% 할인 쿠폰",
            "discountType": "percent",
            "discountValue": 10,
            "available": True
        },
        {
            "couponId": "coupon-002",
            "name": "2,000원 할인 쿠폰",
            "discountType": "amount",
            "discountValue": 2000,
            "available": True
        }
    ]
}

agent = KioskAgent(
    menus=menus,
    set_options=set_options,
    carts_by_session=carts_by_session,
    orders_by_session=orders_by_session,
    promotions=promotions,
    coupons_by_session=coupons_by_session
)

# ----------------------------
# 요청 모델
# ----------------------------
class CartItemRequest(BaseModel):
    menuId: str
    isSet: bool = False
    quantity: int = 1
    selectedSide: Optional[str] = None
    selectedDrink: Optional[str] = None
    drinkSize: Optional[str] = "R"
    toppings: Optional[List[str]] = []


class CartItemPatch(BaseModel):
    quantity: Optional[int] = None
    selectedSide: Optional[str] = None
    selectedDrink: Optional[str] = None
    drinkSize: Optional[str] = None
    toppings: Optional[List[str]] = None


class OrderRequest(BaseModel):
    orderType: Optional[str] = "dineIn"
    couponId: Optional[str] = None


class AgentChatRequest(BaseModel):
    session_id: str
    message: str


# ----------------------------
# 공통 유틸
# ----------------------------
def get_session_cart(session_id: str) -> List[Dict[str, Any]]:
    return carts_by_session.setdefault(session_id, [])


def find_menu_by_id(menu_id: str) -> Optional[Dict[str, Any]]:
    return next((m for m in menus if m["menuId"] == menu_id), None)


def build_cart_summary(session_id: str) -> Dict[str, Any]:
    cart = get_session_cart(session_id)
    total_price = sum(item["subtotal"] for item in cart)
    total_calories = 0

    for item in cart:
        menu = find_menu_by_id(item["menuId"])
        if menu:
            total_calories += menu.get("calories", 0) * item["quantity"]

    return {
        "items": cart,
        "totalPrice": total_price,
        "totalCalories": total_calories,
        "itemCount": len(cart)
    }


def calculate_coupon_discount(total_price: int, coupon: Dict[str, Any]) -> int:
    if coupon["discountType"] == "percent":
        return int(total_price * coupon["discountValue"] / 100)
    if coupon["discountType"] == "amount":
        return int(coupon["discountValue"])
    return 0


# ----------------------------
# 기본 확인용
# ----------------------------
@app.get("/")
def root():
    return {"message": "server is running"}


# ----------------------------
# 기본 메뉴/옵션 API
# ----------------------------
@app.get("/menus")
def get_menus(category: Optional[str] = Query(default=None)):
    if category:
        return [m for m in menus if m.get("category") == category]
    return menus


@app.get("/menus/search")
def search_menus(
    maxCalories: Optional[int] = None,
    minCalories: Optional[int] = None,
    category: Optional[str] = None,
    excludeAllergens: Optional[str] = None,
    maxPrice: Optional[int] = None,
    setAvailable: Optional[bool] = None
):
    result = menus

    if maxCalories is not None:
        result = [m for m in result if m.get("calories", 0) <= maxCalories]

    if minCalories is not None:
        result = [m for m in result if m.get("calories", 0) >= minCalories]

    if category:
        result = [m for m in result if m.get("category") == category]

    if maxPrice is not None:
        if setAvailable:
            result = [m for m in result if m.get("setPrice") is not None and m.get("setPrice", 0) <= maxPrice]
        else:
            result = [m for m in result if m.get("price", 0) <= maxPrice]

    if excludeAllergens:
        excluded = [a.strip() for a in excludeAllergens.split(",")]
        filtered = []
        for menu in result:
            allergens = menu.get("allergens", [])
            if not any(a in allergens for a in excluded):
                filtered.append(menu)
        result = filtered

    if setAvailable:
        result = [m for m in result if m.get("setPrice") is not None]

    return result


@app.get("/menus/{menuId}")
def get_menu_detail(menuId: str):
    menu = find_menu_by_id(menuId)
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")
    return menu


@app.get("/set-options")
def get_all_set_options():
    return set_options


@app.get("/set-options/sides")
def get_sides():
    return set_options.get("sides", [])


@app.get("/set-options/drinks")
def get_drinks():
    return set_options.get("drinks", [])


@app.get("/set-options/toppings")
def get_toppings():
    return set_options.get("toppings", [])


# ----------------------------
# 장바구니 API
# ----------------------------
@app.post("/cart/{session_id}/items")
def add_to_cart(session_id: str, item: CartItemRequest):
    menu = find_menu_by_id(item.menuId)
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")

    if menu.get("soldOut"):
        raise HTTPException(status_code=400, detail="품절된 메뉴입니다")

    cart = get_session_cart(session_id)
    base_price = menu["setPrice"] if item.isSet and menu.get("setPrice") else menu["price"]
    subtotal = base_price * item.quantity

    cart_item = {
        "cartItemId": str(uuid.uuid4()),
        "menuId": item.menuId,
        "name": menu["name"],
        "isSet": item.isSet,
        "quantity": item.quantity,
        "unitPrice": base_price,
        "subtotal": subtotal,
        "selectedSide": item.selectedSide,
        "selectedDrink": item.selectedDrink,
        "drinkSize": item.drinkSize,
        "toppings": item.toppings,
    }
    cart.append(cart_item)

    return {
        "message": "장바구니에 추가되었습니다",
        "cartItem": cart_item
    }


@app.get("/cart/{session_id}")
def get_cart(session_id: str):
    return build_cart_summary(session_id)


@app.patch("/cart/{session_id}/items/{cartItemId}")
def update_cart_item(session_id: str, cartItemId: str, changes: CartItemPatch):
    cart = get_session_cart(session_id)
    cart_item = next((c for c in cart if c["cartItemId"] == cartItemId), None)
    if not cart_item:
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다")

    if changes.quantity is not None:
        if changes.quantity <= 0:
            raise HTTPException(status_code=400, detail="수량은 1 이상이어야 합니다")
        cart_item["quantity"] = changes.quantity
        cart_item["subtotal"] = cart_item["unitPrice"] * changes.quantity

    if changes.selectedSide is not None:
        cart_item["selectedSide"] = changes.selectedSide

    if changes.selectedDrink is not None:
        cart_item["selectedDrink"] = changes.selectedDrink

    if changes.drinkSize is not None:
        cart_item["drinkSize"] = changes.drinkSize

    if changes.toppings is not None:
        cart_item["toppings"] = changes.toppings

    return {
        "message": "장바구니가 수정되었습니다",
        "cartItem": cart_item
    }


@app.delete("/cart/{session_id}/items/{cartItemId}")
def delete_cart_item(session_id: str, cartItemId: str):
    cart = get_session_cart(session_id)
    cart_item = next((c for c in cart if c["cartItemId"] == cartItemId), None)
    if not cart_item:
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다")

    cart.remove(cart_item)

    return {
        "message": "장바구니에서 삭제되었습니다",
        "itemCount": len(cart)
    }


@app.delete("/cart/{session_id}")
def clear_cart(session_id: str):
    carts_by_session[session_id] = []
    return {"message": "장바구니를 비웠습니다"}


# ----------------------------
# 주문 / 리오더 API
# ----------------------------
@app.post("/orders/{session_id}")
def create_order(session_id: str, req: OrderRequest):
    cart = get_session_cart(session_id)
    if not cart:
        raise HTTPException(status_code=400, detail="장바구니가 비어 있습니다")

    total_price = sum(item["subtotal"] for item in cart)

    order = {
        "orderId": str(uuid.uuid4()),
        "items": deepcopy(cart),
        "totalPrice": total_price,
        "orderType": req.orderType,
        "couponId": req.couponId,
        "orderedAt": "2026-04-12T13:00:00"
    }

    orders_by_session.setdefault(session_id, []).append(order)
    carts_by_session[session_id] = []

    return {
        "message": "주문이 완료되었습니다",
        "order": order
    }


@app.get("/orders/{session_id}")
def get_orders(session_id: str):
    return orders_by_session.get(session_id, [])


@app.post("/orders/{session_id}/reorder/{orderId}")
def reorder(session_id: str, orderId: str):
    orders = orders_by_session.get(session_id, [])
    order = next((o for o in orders if o["orderId"] == orderId), None)
    if not order:
        raise HTTPException(status_code=404, detail="주문 이력을 찾을 수 없습니다")

    new_cart = []
    for item in order["items"]:
        cloned = deepcopy(item)
        cloned["cartItemId"] = str(uuid.uuid4())
        new_cart.append(cloned)

    carts_by_session[session_id] = new_cart

    return {
        "message": "이전 주문이 장바구니에 복원되었습니다",
        "cart": build_cart_summary(session_id)
    }


# ----------------------------
# 프로모션 / 쿠폰 API
# ----------------------------
@app.get("/promotions")
def get_promotions():
    return promotions


@app.get("/promotions/{menuId}")
def get_menu_promotions(menuId: str):
    return [p for p in promotions if p["menuId"] == menuId]


@app.get("/coupons")
def get_coupons(session_id: Optional[str] = Query(default=None)):
    if session_id:
        return coupons_by_session.get(session_id, [])
    all_coupons = []
    for coupon_list in coupons_by_session.values():
        all_coupons.extend(coupon_list)
    return all_coupons


# ----------------------------
# 에이전트 API
# ----------------------------
@app.post("/agent/chat")
def agent_chat(req: AgentChatRequest):
    return agent.run(req.session_id, req.message)


@app.post("/agent/test")
def agent_test(req: AgentChatRequest):
    return agent.analyze_with_gemini(req.message)