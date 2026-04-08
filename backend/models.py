## 데이터 모델 (Pydantic) -> 데이터의 형태를 정의하는 파일

from pydantic import BaseModel
from typing import Optional, List


class CartItemRequest(BaseModel):
    menuId: str
    quantity: int = 1
    isSet: bool = False
    selectedSide: Optional[str] = None
    selectedDrink: Optional[str] = None
    drinkSize: Optional[str] = None
    toppings: Optional[List[str]] = None


class CartItemUpdateRequest(BaseModel):
    quantity: Optional[int] = None
    selectedSide: Optional[str] = None
    selectedDrink: Optional[str] = None
    drinkSize: Optional[str] = None
    toppings: Optional[List[str]] = None


class OrderRequest(BaseModel):
    orderType: str = "dineIn"
    couponId: Optional[str] = None


class ChatRequest(BaseModel):
    session_id: str
    message: str
    conversation_history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    reply: Optional[str] = None
    components: Optional[List[dict]] = None
