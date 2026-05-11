from fastapi import APIRouter, HTTPException
from typing import Optional
from data_loader import menus
from utils import _menu_index, _category_index, get_menus_by_category

router = APIRouter(prefix="/menus", tags=["메뉴"])

@router.get("")
def get_menus(category: Optional[str] = None):
    if category:
        return get_menus_by_category(category)
    return menus

@router.get("/search")
def search_menus(
    maxCalories: Optional[int] = None,
    minCalories: Optional[int] = None,
    category: Optional[str] = None,
    excludeAllergens: Optional[str] = None,
    maxPrice: Optional[int] = None,
    setAvailable: Optional[bool] = None,
):
    result = list(_category_index[category]) if category else list(menus)
    if maxCalories is not None:
        result = [m for m in result if m["calories"] <= maxCalories]
    if minCalories is not None:
        result = [m for m in result if m["calories"] >= minCalories]
    if excludeAllergens:
        exclude_list = [a.strip() for a in excludeAllergens.split(",")]
        result = [m for m in result if not any(a in m.get("allergens", []) for a in exclude_list)]
    if maxPrice is not None:
        result = [m for m in result if m["price"] <= maxPrice]
    if setAvailable:
        result = [m for m in result if m.get("setPrice") is not None]
    return result

@router.get("/{menuId}")
def get_menu(menuId: str):
    menu = _menu_index.get(menuId)
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")
    return menu