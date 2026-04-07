import json
with open("menu_data.json", "r", encoding="utf-8") as f:
    menus = json.load(f)
   
def search_menu(keyword : str = None, maxCalories : int = None, category : str = None) -> list:
    """
    메뉴를 검색합니다. 
    키워드, 최대 칼로리, 카테고리로 필터링 할 수 있습니다.
    """
    result = menus

    if keyword:
        result = [m for m in result if keyword in m["name"] or keyword in m["description"] ]

    if maxCalories:
        result = [ m for m in result if m.get("calories", 0) <= maxCalories]

    if category:
        result = [m for m in result if m["category"] == category]

    return result

def get_menu_detail(menuId : str) -> dict:
    """
    메뉴 ID로 특정 메뉴의 상세 정보를 반환합니다.
    """
    for menu in menus:
        if menu["menuId"] == menuId:
            return menu
    return {"error" : "메뉴를 찾을 수 없습니다"}