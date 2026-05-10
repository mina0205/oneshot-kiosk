from fastapi import APIRouter, HTTPException
from models import OrderRequest
from data_loader import promotions, coupons
from store import carts, orders
import store
from utils import find_menu, build_cart_response
from datetime import datetime
import uuid

router = APIRouter(prefix="/orders", tags=["주문"])


@router.post("/{session_id}")
def create_order(session_id: str, req: OrderRequest):
    """장바구니 → 주문 생성"""
    cart = carts.get(session_id, {})
    if not cart:
        raise HTTPException(status_code=400, detail="장바구니가 비어있습니다")

    cart_response = build_cart_response(session_id)

    # 쿠폰 할인
    coupon_discount = 0
    if req.couponId:
        coupon = None
        for c in coupons:
            if c["couponId"] == req.couponId:
                coupon = c
                break
        if coupon and cart_response["totalPrice"] >= coupon["minOrderPrice"]:
            if coupon["discountType"] == "amount":
                coupon_discount = coupon["discountValue"]
            elif coupon["discountType"] == "rate":
                coupon_discount = int(cart_response["totalPrice"] * coupon["discountValue"])

    # 프로모션 할인
    promo_discount = 0
    for item in cart_response["items"]:
        menu_promos = [
            p for p in promotions
            if p["isActive"] and item["menuId"] in p.get("applicableMenuIds", [])
        ]
        for promo in menu_promos:
            # 세트 한정 프로모션인데 단품이면 건너뛰기
            if promo.get("setOnly", False) and not item.get("isSet", False):
                continue
            if promo["discountType"] == "rate":
                promo_discount += int(item["unitPrice"] * promo["discountValue"]) * item["quantity"]
            elif promo["discountType"] == "amount":
                promo_discount += promo["discountValue"] * item["quantity"]



    total_discount = coupon_discount + promo_discount
    final_price = max(0, cart_response["totalPrice"] - total_discount)

    store.order_counter += 1

    order = {
        "orderId": f"ORD-{datetime.now().strftime('%Y%m%d')}-{store.order_counter:03d}",
        "items": cart_response["items"],
        "totalPrice": cart_response["totalPrice"],
        "discount": total_discount,
        "finalPrice": final_price,
        "orderType": req.orderType,
        "orderNumber": store.order_counter,
        "estimatedTime": max(5, len(cart_response["items"]) * 2),
        "createdAt": datetime.now().isoformat(),
    }

    if session_id not in orders:
        orders[session_id] = []
    orders[session_id].append(order)

    carts[session_id] = {}

    return {
        "type": "OrderComplete",
        "orderId": order["orderId"],
        "orderNumber": order["orderNumber"],
        "estimatedTime": order["estimatedTime"],
        "totalPrice": order["totalPrice"],      
        "discount": order["discount"],  
        "finalPrice": order["finalPrice"],
        "orderType": order["orderType"],
    }


@router.get("/{session_id}")
def get_orders(session_id: str):
    """주문 이력 조회"""
    order_list = orders.get(session_id, [])

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


@router.post("/{session_id}/reorder/{orderId}")
def reorder(session_id: str, orderId: str):
    """이전 주문 복원 → 장바구니에 담기"""
    order_list = orders.get(session_id, [])

    target_order = None
    for o in order_list:
        if o["orderId"] == orderId:
            target_order = o
            break

    if not target_order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")

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
