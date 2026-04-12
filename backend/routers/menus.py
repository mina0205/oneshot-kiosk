from fastapi import APIRouter, HTTPException
from typing import Optional
from data_loader import menus

router = APIRouter(prefix="/menus", tags=["메뉴"])


@router.get("")
def get_menus(category: Optional[str] = None):
    """전체 메뉴 조회. category 파라미터로 필터 가능"""
    if category:
        return [m for m in menus if m["category"] == category]
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
    """조건 기반 메뉴 검색"""
    result = menus

    if category:
        result = [m for m in result if m["category"] == category]

    if maxCalories is not None:
        result = [m for m in result if m["calories"] <= maxCalories]

    if minCalories is not None:
        result = [m for m in result if m["calories"] >= minCalories]

    if excludeAllergens:
        exclude_list = [a.strip() for a in excludeAllergens.split(",")]
        result = [
            m for m in result
            if not any(a in m.get("allergens", []) for a in exclude_list)
        ]

    if maxPrice is not None:
        result = [m for m in result if m["price"] <= maxPrice]

    if setAvailable is not None and setAvailable:
        result = [m for m in result if m.get("setPrice") is not None]

    return result


@router.get("/{menuId}")
def get_menu(menuId: str):
    """단일 메뉴 상세 조회"""
    for menu in menus:
        if menu["menuId"] == menuId:
            return menu
    raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")
