from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
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

cart = []


@app.get("/menus")
def get_menus():
    return menus


@app.get("/menus/search")
def search_menus(
    maxCalories: Optional[int] = None,
    category: Optional[str] = None,
    excludeAllergens: Optional[str] = None,
):
    result = menus

    if category:
        result = [m for m in result if m.get("category") == category]

    if maxCalories is not None:
        result = [m for m in result if m["calories"] <= maxCalories]

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


@app.post("/cart")
def add_to_cart(item: CartItemRequest):
    menu = next((m for m in menus if m["menuId"] == item.menuId), None)
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")

    if menu.get("soldOut"):
        raise HTTPException(status_code=400, detail="품절된 메뉴입니다")

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


@app.get("/cart")
def get_cart():
    total_price = sum(item["subtotal"] for item in cart)
    total_calories = 0

    for item in cart:
        menu = next((m for m in menus if m["menuId"] == item["menuId"]), None)
        if menu:
            total_calories += menu["calories"] * item["quantity"]

    return {
        "items": cart,
        "totalPrice": total_price,
        "totalCalories": total_calories,
        "itemCount": len(cart)
    }


@app.patch("/cart/{cartItemId}")
def update_cart_item(cartItemId: str, changes: CartItemPatch):
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


@app.delete("/cart/{cartItemId}")
def delete_cart_item(cartItemId: str):
    cart_item = next((c for c in cart if c["cartItemId"] == cartItemId), None)
    if not cart_item:
        raise HTTPException(status_code=404, detail="장바구니 항목을 찾을 수 없습니다")

    cart.remove(cart_item)

    return {
        "message": "장바구니에서 삭제되었습니다",
        "itemCount": len(cart)
    }