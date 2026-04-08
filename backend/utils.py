from data_loader import menus, set_options
from store import carts


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
