from fastapi import APIRouter
from data_loader import set_options

router = APIRouter(prefix="/set-options", tags=["세트 옵션"])


@router.get("")
def get_set_options():
    """세트 옵션 전체 조회"""
    return set_options


@router.get("/sides")
def get_sides():
    """사이드 옵션 목록"""
    return set_options["sides"]


@router.get("/drinks")
def get_drinks():
    """음료 옵션 목록"""
    return set_options["drinks"]


@router.get("/toppings")
def get_toppings():
    """토핑 옵션 목록"""
    return set_options["toppings"]
