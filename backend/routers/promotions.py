from fastapi import APIRouter
from typing import Optional
from data_loader import promotions

router = APIRouter(prefix="/promotions", tags=["프로모션"])


@router.get("")
def get_promotions(activeOnly: Optional[bool] = True):
    """활성 프로모션 조회"""
    if activeOnly:
        return [p for p in promotions if p["isActive"]]
    return promotions


@router.get("/{menuId}")
def get_promotions_for_menu(menuId: str):
    """특정 메뉴에 적용 가능한 프로모션 조회"""
    return [
        p for p in promotions
        if p["isActive"] and menuId in p.get("applicableMenuIds", [])
    ]
