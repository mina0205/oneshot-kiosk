from google.genai import types

TOOLS: list[types.Tool] = [
    types.Tool(function_declarations=[

        # ── 메뉴 조회 ───────────────────────────────────────

        types.FunctionDeclaration(
            name="get_all_menus",
            description=(
                "전체 메뉴 목록을 조회합니다. "
                "카테고리를 지정하면 해당 카테고리만 반환합니다. "
                "사용 가능한 카테고리: burger, chicken, side, drink, iceshot. "
                "'버거 뭐 있어?', '치킨 메뉴 보여줘' 같은 요청에 사용합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "category": types.Schema(
                        type=types.Type.STRING,
                        description="카테고리 필터 (선택). burger | chicken | side | drink | iceshot",
                    ),
                },
            ),
        ),

        types.FunctionDeclaration(
            name="search_menus_by_condition",
            description=(
                "조건으로 메뉴를 필터링해 검색합니다. "
                "칼로리 제한('칼로리 500 이하'), 알레르겐 제외('견과류 빼고'), "
                "가격 상한('2만원 이하'), 세트 가능 여부('세트 되는 것만') 등에 사용합니다. "
                "조건 기반 추천 시 가장 먼저 호출해야 할 Tool입니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "maxCalories": types.Schema(type=types.Type.INTEGER, description="최대 칼로리"),
                    "minCalories": types.Schema(type=types.Type.INTEGER, description="최소 칼로리"),
                    "category": types.Schema(type=types.Type.STRING, description="카테고리 필터"),
                    "excludeAllergens": types.Schema(
                        type=types.Type.STRING,
                        description="제외할 알레르겐, 쉼표 구분 (예: '땅콩,우유')",
                    ),
                    "maxPrice": types.Schema(type=types.Type.INTEGER, description="최대 단품 가격"),
                    "setAvailable": types.Schema(
                        type=types.Type.BOOLEAN,
                        description="true면 세트 가능 메뉴만 반환",
                    ),
                },
            ),
        ),

        # ── 세트 옵션 ────────────────────────────────────────

        types.FunctionDeclaration(
            name="get_set_options",
            description=(
                "세트 메뉴의 사이드·음료 옵션 목록을 조회합니다. "
                "세트 주문 시 사이드나 음료 선택이 필요할 때 사용합니다. "
                "type을 지정하지 않으면 전체(사이드+음료)를 반환합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "type": types.Schema(
                        type=types.Type.STRING,
                        description="조회 타입 (선택): sides | drinks. 생략하면 전체 반환",
                    ),
                },
            ),
        ),

        # ── 장바구니 ─────────────────────────────────────────

        types.FunctionDeclaration(
            name="get_cart",
            description=(
                "현재 세션의 장바구니를 조회합니다. "
                "주문 수정(S-03)에서 cartItemId를 확인하거나, "
                "현재 장바구니 상태를 Cart 컴포넌트로 보여줄 때 사용합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id"],
                properties={
                    "session_id": types.Schema(type=types.Type.STRING, description="세션 ID"),
                },
            ),
        ),

        types.FunctionDeclaration(
            name="add_to_cart",
            description=(
                "장바구니에 메뉴를 추가합니다. "
                "menuId는 반드시 실제 API에서 조회한 값을 사용하세요. "
                "세트 주문이면 isSet=true, selectedSide, selectedDrink, drinkSize를 함께 전달하세요. "
                "사이드·음료를 사용자가 명시하지 않았으면 먼저 get_set_options를 호출해 선택지를 보여주세요."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id", "menuId"],
                properties={
                    "session_id": types.Schema(type=types.Type.STRING, description="세션 ID"),
                    "menuId": types.Schema(type=types.Type.STRING, description="메뉴 ID"),
                    "quantity": types.Schema(type=types.Type.INTEGER, description="수량 (기본 1)"),
                    "isSet": types.Schema(type=types.Type.BOOLEAN, description="세트 여부"),
                    "selectedSide": types.Schema(type=types.Type.STRING, description="세트 사이드 이름"),
                    "selectedDrink": types.Schema(type=types.Type.STRING, description="세트 음료 이름"),
                    "drinkSize": types.Schema(type=types.Type.STRING, description="음료 사이즈: R | L"),
                },
            ),
        ),

        types.FunctionDeclaration(
            name="update_cart_item",
            description=(
                "장바구니의 특정 항목을 수정합니다. "
                "변경할 필드만 전달하면 나머지는 유지됩니다. "
                "cartItemId는 get_cart로 먼저 확인하세요. "
                "'감자튀김을 어니언링으로 바꿔줘' 같은 주문 수정 요청에 사용합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id", "cartItemId"],
                properties={
                    "session_id": types.Schema(type=types.Type.STRING, description="세션 ID"),
                    "cartItemId": types.Schema(type=types.Type.STRING, description="장바구니 항목 ID"),
                    "quantity": types.Schema(type=types.Type.INTEGER, description="수량"),
                    "selectedSide": types.Schema(type=types.Type.STRING, description="변경할 사이드"),
                    "selectedDrink": types.Schema(type=types.Type.STRING, description="변경할 음료"),
                    "drinkSize": types.Schema(type=types.Type.STRING, description="음료 사이즈: R | L"),
                },
            ),
        ),

        types.FunctionDeclaration(
            name="delete_cart_item",
            description=(
                "장바구니에서 특정 항목 하나를 삭제합니다. "
                "cartItemId는 get_cart로 먼저 확인하세요. "
                "'치킨버거 빼줘', '첫 번째 항목 삭제해줘' 같은 요청에 사용합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id", "cartItemId"],
                properties={
                    "session_id": types.Schema(type=types.Type.STRING, description="세션 ID"),
                    "cartItemId": types.Schema(type=types.Type.STRING, description="삭제할 항목 ID"),
                },
            ),
        ),

    ])
]