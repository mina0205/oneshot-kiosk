from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
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

cart = []

class CartItemRequest(BaseModel):
    menuId: str
    isSet: bool = False
    quantity: int = 1
    selectedSide: Optional[str] = None
    selectedDrink: Optional[str] = None
    drinkSize: Optional[str] = "R"
    toppings: Optional[List[str]] = []

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