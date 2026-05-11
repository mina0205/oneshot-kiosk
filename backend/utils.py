from data_loader import menus, set_options, coupons, promotions
from store import carts
from collections import defaultdict
import re

# 인덱스 (O(1) 탐색)
_menu_index: dict = {m["menuId"]: m for m in menus}
_topping_index: dict = {t["name"]: t for t in set_options["toppings"]}
_coupon_index: dict = {c["couponId"]: c for c in coupons}

_promo_index: dict = defaultdict(list)
for p in promotions:
    if p["isActive"]:
        for mid in p.get("applicableMenuIds", []):
            _promo_index[mid].append(p)

_category_index: dict = defaultdict(list)
for m in menus:
    _category_index[m["category"]].append(m)

def get_menus_by_category(category: str) -> list:
    return _category_index.get(category, [])

def find_menu(menu_id: str):
    return _menu_index.get(menu_id)

def find_set_option(option_type: str, name: str):
    options = set_options.get(f"{option_type}s", [])
    for opt in options:
        if opt["name"] == name:
            return opt
    return None

def find_topping(name: str):
    return _topping_index.get(name)

def calculate_unit_price(menu, item_data: dict) -> int:
    if item_data.get("isSet") and menu.get("setPrice"):
        base = menu["setPrice"]
    else:
        base = menu["price"]
    if item_data.get("selectedSide"):
        side = find_set_option("side", item_data["selectedSide"])
        if side:
            base += side["priceDiff"]
    if item_data.get("selectedDrink"):
        drink_name = item_data["selectedDrink"]
        size = item_data.get("drinkSize", "R")
        for d in set_options["drinks"]:
            if d["name"] == drink_name and d["size"] == size:
                base += d["priceDiff"]
                break
    if item_data.get("toppings"):
        for topping_name in item_data["toppings"]:
            topping = find_topping(topping_name)
            if topping:
                base += topping["price"]
    return base

def build_cart_response(session_id: str) -> dict:
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

def parse_quantity(text: str) -> int:
    korean_nums = {
        "한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5,
        "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10
    }
    for word, num in korean_nums.items():
        if f"{word} 개" in text or f"{word}개" in text:
            return num
    match = re.search(r"(\d+)\s*개", text)
    if match:
        return int(match.group(1))
    return 1

def parse_drink_size(text: str) -> str:
    if any(kw in text.lower() for kw in ["라지", "large", "l사이즈", "큰"]):
        return "L"
    return "R"

def calculate_coupon_discount(coupon: dict, total_price: int) -> int:
    discount_type = coupon.get("discountType", "")
    discount_value = coupon.get("discountValue", 0)
    if discount_type == "percentage":
        discount = int(total_price * discount_value / 100)
        max_discount = coupon.get("maxDiscount", float("inf"))
        return min(discount, max_discount)
    elif discount_type == "fixed":
        return min(discount_value, total_price)
    return 0