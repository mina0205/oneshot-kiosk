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

        types.FunctionDeclaration(
            name="get_menu_detail",
            description=(
                "특정 메뉴 1개의 상세 정보를 조회합니다. "
                "menuId로 영양정보, 알레르겐, 가격, 설명 등을 확인할 때 사용합니다. "
                "메뉴 비교(S-07)에서는 이 Tool을 2회 호출하여 ComparisonTable을 구성합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["menuId"],
                properties={
                    "menuId": types.Schema(
                        type=types.Type.STRING,
                        description="조회할 메뉴 ID (예: burger-001)",
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

         types.FunctionDeclaration(
            name="get_toppings",
            description=(
                "추가 가능한 토핑 목록을 조회합니다. "
                "커스텀 빌더(S-10)에서 '치즈 올려줘', '토핑 추가할래' 같은 "
                "요청에 사용합니다. set-options/toppings 엔드포인트를 호출합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={},
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
                "사이드·음료를 사용자가 명시하지 않았으면 먼저 get_set_options를 호출해 선택지를 보여주세요. "
                "토핑을 추가하려면 toppings 배열에 토핑명을 넣으세요."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id", "menuId"],
                properties={
                    "session_id": types.Schema(type=types.Type.STRING, description="세션 ID"),
                    "menuId": types.Schema(type=types.Type.STRING, description="메뉴 ID"),
                    "quantity": types.Schema(type=types.Type.INTEGER, description="수량 (기본 1)"),
                    "isSet": types.Schema(type=types.Type.BOOLEAN, description="세트 여부"),
                    "selectedSide": types.Schema(type=types.Type.STRING, description="세트 사이드 메뉴 이름 (예: '포테이토(R)', '코울슬로'). ID가 아닌 이름을 넣어라."),
                    "selectedDrink": types.Schema(type=types.Type.STRING, description="세트 음료 이름 (예: '제로슈거콜라', '사이다'). ID가 아닌 이름을 넣어라."),
                    "drinkSize": types.Schema(type=types.Type.STRING, description="음료 사이즈: R | L"),

                    "toppings": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                        description="추가 토핑 목록 (예: ['치즈토핑', '베이컨토핑'])",
                    ),
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

        types.FunctionDeclaration(
            name="get_orders",
            description=(
                "현재 세션의 이전 주문 이력을 조회합니다. "
                "'지난번에 뭐 시켰지?', '주문 내역 보여줘' 같은 요청에 사용합니다. "
                "리오더(S-06) 시 먼저 이 Tool로 주문 ID를 확인한 뒤 reorder를 호출하세요."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id"],
                properties={
                    "session_id": types.Schema(
                        type=types.Type.STRING,
                        description="세션 ID",
                    ),
                },
            ),
        ),

        types.FunctionDeclaration(
            name="reorder",
            description=(
                "이전 주문을 장바구니에 다시 담습니다. "
                "'지난번 거 다시 주문해줘', '같은 걸로 다시' 같은 요청에 사용합니다. "
                "반드시 get_orders로 order_id를 먼저 확인한 뒤 호출하세요."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id", "order_id"],
                properties={
                    "session_id": types.Schema(
                        type=types.Type.STRING,
                        description="세션 ID",
                    ),
                    "order_id": types.Schema(
                        type=types.Type.STRING,
                        description="재주문할 주문 ID",
                    ),
                },
            ),
        ),

        # ── S-09: 프로모션 / 쿠폰 ───────────────────────────

        types.FunctionDeclaration(
            name="get_promotions",
            description=(
                "현재 활성화된 프로모션 목록을 조회합니다. "
                "menu_id를 지정하면 해당 메뉴의 프로모션만 반환합니다. "
                "'할인 뭐 있어?', '프로모션 알려줘', '이 메뉴 할인되나?' 같은 요청에 사용합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "menu_id": types.Schema(
                        type=types.Type.STRING,
                        description="특정 메뉴 ID (선택). 생략하면 전체 프로모션 반환",
                    ),
                },
            ),
        ),

        types.FunctionDeclaration(
            name="get_coupons",
            description=(
                "사용 가능한 쿠폰 목록을 조회합니다. "
                "'쿠폰 있어?', '쿠폰 써줘', '할인 쿠폰 보여줘' 같은 요청에 사용합니다. "
                "CouponSelector 컴포넌트를 반환할 때 사용합니다."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id"],
                properties={
                    "session_id": types.Schema(
                        type=types.Type.STRING,
                        description="세션 ID",
                    ),
                },
            ),
        ),

        # ── S-10: 주문 확정 ──────────────────────────────────

        types.FunctionDeclaration(
            name="create_order",
            description=(
                "장바구니의 내용을 주문으로 확정합니다. "
                "'결제할게', '주문 완료', '매장에서 먹을게' 같은 요청에 사용합니다. "
                "orderType은 'dineIn'(매장) 또는 'takeOut'(포장)입니다. "
                "쿠폰을 적용하려면 couponId를 함께 전달하세요."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                required=["session_id", "orderType"],
                properties={
                    "session_id": types.Schema(
                        type=types.Type.STRING,
                        description="세션 ID",
                    ),
                    "orderType": types.Schema(
                        type=types.Type.STRING,
                        description="주문 유형: dineIn | takeOut",
                    ),
                    "couponId": types.Schema(
                        type=types.Type.STRING,
                        description="적용할 쿠폰 ID (선택)",
                    ),
                },
            ),
        ),

    ])
]