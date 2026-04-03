from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

with open ("menu_data.json", "r", encoding = "utf-8") as f:
    menus = json.load(f)

cart = []

@app.get("/menus")
def get_menus():
    return menus

@app.get("/menus/search")
def search_menus(maxCalories : int = None):
    result = menus
    result = []
    for m in menus : 
        if m["calories"] <= maxCalories:
            result.append(m)
    return result

@app.get("/menus/{menuId}")
def get_menu(menuId : str):
    for menu in menus:
        if menu["menuId"] == menuId:
            return menu
    raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다")