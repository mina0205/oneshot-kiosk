from fastapi import APIRouter, HTTPException
from models import CartItemRequest, CartItemUpdateRequest
from data_loader import menus
from store import carts
from utils import find_menu, build_cart_response
import uuid

router = APIRouter(prefix="/cart", tags=["장바구니"])


@router.get("/{session_id}")
def get_cart(session_id: str):
    """장바구니 조회"""
    return build_cart_response(session_id)


@router.post("/{session_id}/items")
def add_to_cart(session_id: str, item: CartItemRequest):
    """장바구니에 항목 추가"""
    menu = find_menu(item.menuId)
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")

    if menu.get("soldOut"):
        raise HTTPException(status_code=400, detail="품절된 메뉴입니다")

    if item.isSet and menu.get("setPrice") is None:
        raise HTTPException(status_code=400, detail="세트 구성이 불가능한 메뉴입니다")

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


@router.patch("/{session_id}/items/{cartItemId}")
def update_cart_item(session_id: str, cartItemId: str, update: CartItemUpdateRequest):
    """장바구니 항목 수정"""
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

    item["isModified"] = True

    return build_cart_response(session_id)


@router.delete("/{session_id}/items/{cartItemId}")
def remove_cart_item(session_id: str, cartItemId: str):
    """장바구니에서 항목 삭제"""
    if session_id not in carts or cartItemId not in carts[session_id]:
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다")

    del carts[session_id][cartItemId]
    return build_cart_response(session_id)


@router.delete("/{session_id}")
def clear_cart(session_id: str):
    """장바구니 전체 비우기"""
    carts[session_id] = {}
    return build_cart_response(session_id)
