from fastapi import APIRouter
from typing import Optional
from data_loader import coupons
from utils import build_cart_response
from store import carts

router = APIRouter(prefix="/coupons", tags=["쿠폰"])


@router.get("")
def get_coupons(session_id: Optional[str] = None):
    """사용 가능한 쿠폰 목록 조회"""
    total_price = 0
    if session_id and session_id in carts:
        cart_response = build_cart_response(session_id)
        total_price = cart_response["totalPrice"]

    result = []
    for c in coupons:
        result.append({
            **c,
            "isApplicable": total_price >= c["minOrderPrice"] if session_id else True
        })

    return {
        "type": "CouponSelector",
        "coupons": result,
        "selectedCouponId": None
    }
