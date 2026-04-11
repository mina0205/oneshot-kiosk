from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("menu_data.json", "r", encoding="utf-8") as f:
    menus = json.load(f)


@app.get("/menus")
def get_menus():
    return menus


@app.get("/menus/search")
def search_menus(
    maxCalories: Optional[int] = None,
    category: Optional[str] = None,
    excludeAllergens: Optional[str] = None,  # 쉼표 구분: "땅콩,우유"
):
    result = menus

    # 카테고리 필터
    if category:
        result = [m for m in result if m.get("category") == category]

    # 칼로리 필터
    if maxCalories is not None:
        result = [m for m in result if m["calories"] <= maxCalories]

    # 알레르기 필터 (해당 알레르겐 포함 메뉴 제외)
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
