"""
agent.py — 에이전트 메인 로직

최적화 포인트:
- 쿠폰, 프로모션, 장바구니, 주문내역, 결제 같은 고정 요청은 Gemini를 거치지 않고 바로 처리한다.
- 복잡한 자연어 주문, 추천, 비교, 커스텀 주문만 Gemini로 보낸다.
"""

import json
import logging
import os
import re
import time

from google import genai
from google.genai import types

from data_loader import menus
from prompts import SYSTEM_PROMPT
from tools import TOOLS
from tool_executor import execute_tool
from session import get_history, append_user, append_model, clear_session
from parser import parse_and_validate

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_TOOL_ROUNDS = int(os.getenv("MAX_TOOL_ROUNDS", "10"))

logger = logging.getLogger(__name__)
_client = None

_GENAI_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=TOOLS,
    temperature=0.2,
    max_output_tokens=int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "4096")),
    response_mime_type="text/plain",
)


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client()
    return _client

_CATEGORY_KEYWORDS = {
    "burger": ("burger", "\ubc84\uac70"),
    "chicken": ("chicken", "\uce58\ud0a8", "\uce58\ub0a8"),
    "side": ("side", "\uc0ac\uc774\ub4dc", "\uac10\uc790", "\ub108\uac9f"),
    "drink": ("drink", "\uc74c\ub8cc", "\ucf5c\ub77c", "\ucee4\ud53c"),
    "iceshot": ("iceshot", "\uc544\uc774\uc2a4", "\uc120\ub370"),
}
_MENU_INTENT_KEYWORDS = (
    "\uba54\ub274",
    "\ucd94\ucc9c",
    "\ubcf4\uc5ec",
    "\ucc3e\uc544",
    "\uc54c\ub824",
    "menu",
    "recommend",
)
_NON_MENU_FAST_PATH_KEYWORDS = (
    "\ub2f4\uc544",
    "\ucd94\uac00",
    "\uc8fc\ubb38",
    "\uacb0\uc81c",
    "\uc7a5\ubc14\uad6c\ub2c8",
    "\uc218\uc815",
    "\uc0ad\uc81c",
    "\ucfe0\ud3f0",
    "\ud504\ub85c\ubaa8\uc158",
)


def _menu_card(menu: dict) -> dict:
    return {
        "type": "MenuCard",
        "menuId": menu.get("menuId"),
        "name": menu.get("name"),
        "price": menu.get("price"),
        "setPrice": menu.get("setPrice"),
        "calories": menu.get("calories"),
        "image": menu.get("image"),
        "description": menu.get("description"),
        "allergens": menu.get("allergens", []),
        "isNew": menu.get("isNew", False),
        "isBestSeller": menu.get("isBestSeller", False),
        "soldOut": menu.get("soldOut", False),
    }


def _extract_max_number(message: str, units: tuple[str, ...]) -> int | None:
    unit_pattern = "|".join(re.escape(unit) for unit in units)
    matches = re.findall(r"(\d+(?:\.\d+)?)\s*(%s)" % unit_pattern, message, re.IGNORECASE)
    if not matches:
        return None

    value, unit = matches[0]
    number = float(value)
    if unit == "\ub9cc\uc6d0":
        number *= 10000
    return int(number)


def _try_fast_menu_response(session_id: str, user_message: str, req_t0: float) -> dict | None:
    get_history(session_id)
    lowered = user_message.lower()
    if any(keyword in lowered for keyword in _NON_MENU_FAST_PATH_KEYWORDS):
        return None
    if not any(keyword in lowered for keyword in _MENU_INTENT_KEYWORDS):
        return None

    category = None
    for candidate, keywords in _CATEGORY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            category = candidate
            break

    max_calories = _extract_max_number(lowered, ("kcal", "\uce7c\ub85c\ub9ac"))
    max_price = _extract_max_number(lowered, ("\uc6d0", "\ub9cc\uc6d0"))

    if category is None and max_calories is None and max_price is None:
        return None

    filtered = menus
    if category:
        filtered = [menu for menu in filtered if menu.get("category") == category]
    if max_calories is not None:
        filtered = [menu for menu in filtered if menu.get("calories", 0) <= max_calories]
    if max_price is not None:
        filtered = [menu for menu in filtered if menu.get("price", 0) <= max_price]

    filtered = sorted(
        filtered,
        key=lambda menu: (not menu.get("isBestSeller", False), menu.get("price", 0)),
    )
    components = [_menu_card(menu) for menu in filtered[:3]]

    if not components:
        result = {
            "reply": "\uc870\uac74\uc5d0 \ub9de\ub294 \uba54\ub274\ub97c \ucc3e\uc9c0 \ubabb\ud588\uc5b4\uc694.",
            "components": [],
        }
    else:
        result = {
            "reply": f"\uc870\uac74\uc5d0 \ub9de\ub294 \uba54\ub274 {len(components)}\uac1c\ub97c \ubcf4\uc5ec\ub4dc\ub9b4\uac8c\uc694.",
            "components": components,
        }

    append_model(
        session_id,
        types.Content(
            role="model",
            parts=[types.Part.from_text(text=json.dumps(result, ensure_ascii=False))],
        ),
    )
    logger.warning(
        "[%s] done total_ms=%.1f rounds=0 status=fast_menu",
        session_id,
        (time.perf_counter() - req_t0) * 1000,
    )
    return result


async def process_message(session_id: str, user_message: str) -> dict:
    req_t0 = time.perf_counter()
    # 1. 고정 요청은 Gemini 호출 전에 바로 처리
    fast_result = await _try_fast_path(session_id, user_message)
    if fast_result is not None:
        return fast_result

    # 2. 여기부터는 복잡한 요청만 Gemini 사용
    append_user(session_id, [types.Part.from_text(text=user_message)])

    fast_result = _try_fast_menu_response(session_id, user_message, req_t0)
    if fast_result is not None:
        return fast_result

    for round_num in range(MAX_TOOL_ROUNDS):
        logger.debug("[%s] Gemini 호출 round=%d", session_id, round_num)

        try:
            t0 = time.perf_counter()
            response = _get_client().models.generate_content(
                model=GEMINI_MODEL,
                contents=get_history(session_id),
                config=_GENAI_CONFIG,
            )
            t1 = time.perf_counter()
            logger.warning(
                "[%s] round=%d gemini_ms=%.1f",
                session_id,
                round_num,
                (t1 - t0) * 1000,
            )
        except Exception as e:
            error_str = str(e)

            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                logger.warning("[%s] Gemini API 쿼터 초과. 잠시 후 다시 시도해주세요.", session_id)
                logger.warning(
                    "[%s] done total_ms=%.1f rounds=%d status=quota_exceeded",
                    session_id,
                    (time.perf_counter() - req_t0) * 1000,
                    round_num + 1,
                )
                return {
                    "reply": "잠시 요청이 많아 처리가 지연되고 있습니다. 10초 후에 다시 시도해주세요.",
                    "components": [],
                }
            elif "503" in error_str or "UNAVAILABLE" in error_str:
                logger.warning("[%s] Gemini API 서버 과부하.", session_id)
                logger.warning(
                    "[%s] done total_ms=%.1f rounds=%d status=unavailable",
                    session_id,
                    (time.perf_counter() - req_t0) * 1000,
                    round_num + 1,
                )
                return {
                    "reply": "AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.",
                    "components": [],
                }
            else:
                logger.error("[%s] Gemini API 오류: %s", session_id, e)
                logger.warning(
                    "[%s] done total_ms=%.1f rounds=%d status=gemini_error",
                    session_id,
                    (time.perf_counter() - req_t0) * 1000,
                    round_num + 1,
                )
                return {
                    "reply": "AI 응답 중 오류가 발생했습니다. 다시 시도해주세요.",
                    "components": [],
                }

        model_content = response.candidates[0].content

        logger.warning("[%s] finish_reason=%s", session_id, response.candidates[0].finish_reason)
        logger.warning("[%s] 응답길이=%d | 전문: %s", session_id, len(str(model_content)), str(model_content)[:1000])

        if not model_content or not model_content.parts:
            logger.warning(f"[{session_id}] Gemini returned empty parts")
            logger.warning(
                "[%s] done total_ms=%.1f rounds=%d status=empty_parts",
                session_id,
                (time.perf_counter() - req_t0) * 1000,
                round_num + 1,
            )
            return {
                "reply": "죄송합니다. 응답을 생성하지 못했습니다. 다시 말씀해주세요.",
                "components": [],
            }

        append_model(session_id, model_content)

        tool_call_parts = [p for p in model_content.parts if p.function_call]

        if not tool_call_parts:
            final_text = "".join(
                p.text for p in model_content.parts
                if hasattr(p, "text") and p.text
            )

            logger.debug("[%s] 최종 응답 수신 len=%d", session_id, len(final_text))

            final_text = _fix_json_text(final_text)

            result = parse_and_validate(final_text)
            _post_process(session_id, result)
            logger.warning(
                "[%s] done total_ms=%.1f rounds=%d status=ok",
                session_id,
                (time.perf_counter() - req_t0) * 1000,
                round_num + 1,
            )
            return result

        tool_result_parts = []

        for part in tool_call_parts:
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}

            tool_args["session_id"] = session_id

            logger.info("[%s] Tool 실행: %s(%s)", session_id, fc.name, tool_args)
            t0 = time.perf_counter()
            tool_result = await execute_tool(fc.name, tool_args)
            t1 = time.perf_counter()
            logger.warning(
                "[%s] round=%d tool=%s tool_ms=%.1f",
                session_id,
                round_num,
                fc.name,
                (t1 - t0) * 1000,
            )
            logger.debug("[%s] Tool 결과: %s", session_id, str(tool_result)[:300])

            tool_result_parts.append(
                types.Part.from_function_response(
                    name=fc.name,
                    response={"result": tool_result},
                )
            )

        append_user(session_id, tool_result_parts)

    # MAX_TOOL_ROUNDS 초과 — 안전 fallback
    logger.error("[%s] Tool 루프 최대 반복(%d) 초과", session_id, MAX_TOOL_ROUNDS)
    logger.warning(
        "[%s] done total_ms=%.1f rounds=%d status=max_tool_rounds_exceeded",
        session_id,
        (time.perf_counter() - req_t0) * 1000,
        MAX_TOOL_ROUNDS,
    )
    return {
        "reply": "죄송합니다, 처리 중 문제가 발생했습니다. 다시 말씀해 주세요.",
        "components": [],
        "_error": "max_tool_rounds_exceeded",
    }


async def _try_fast_path(session_id: str, user_message: str) -> dict | None:
    """
    Gemini를 거치지 않아도 되는 고정 요청을 직접 처리한다.

    처리 대상:
    - 쿠폰 조회
    - 프로모션/이벤트/할인 조회
    - 장바구니 조회
    - 주문 내역 조회
    - 이전 주문 그대로 담기
    - 결제/주문 확정
    """

    msg = _normalize(user_message)

    # 너무 복잡한 요청은 fast path에서 처리하지 않는다.
    # 예: "쿠폰 적용해서 불고기버거 세트 추천해줘" 같은 요청은 AI가 필요함.
    if _looks_complex(msg):
        return None

    # 1. 쿠폰 조회
    if _has_any(msg, ["쿠폰", "할인쿠폰"]):
        coupons = await execute_tool("get_coupons", {"session_id": session_id})

        return {
            "reply": "사용 가능한 쿠폰을 보여드릴게요.",
            "components": [
                _ensure_component(coupons, "CouponSelector")
            ],
            "_fastPath": "coupons",
        }

    # 2. 프로모션 / 이벤트 / 할인 조회
    if _has_any(msg, ["프로모션", "이벤트", "행사", "할인중", "할인 중", "할인 메뉴", "지금 할인"]):
        promotions = await execute_tool("get_promotions", {"session_id": session_id})

        return {
            "reply": "현재 진행 중인 프로모션을 보여드릴게요.",
            "components": [
                {
                    "type": "PromotionBanner",
                    "promotions": promotions,
                }
            ],
            "_fastPath": "promotions",
        }

    # 3. 장바구니 조회
    if _has_any(msg, ["장바구니", "담은거", "담은 거", "카트", "주문 확인", "담긴거", "담긴 거"]):
        cart = await execute_tool("get_cart", {"session_id": session_id})

        return {
            "reply": "현재 장바구니를 보여드릴게요.",
            "components": [
                _ensure_component(cart, "Cart")
            ],
            "_fastPath": "cart",
        }

    # 4. 주문 내역 조회
    if _has_any(msg, ["주문내역", "주문 내역", "이전 주문", "지난 주문", "전에 시킨", "전에 주문"]):
        orders = await execute_tool("get_orders", {"session_id": session_id})

        return {
            "reply": "이전 주문 내역을 보여드릴게요.",
            "components": [
                _ensure_component(orders, "OrderHistory")
            ],
            "_fastPath": "order_history",
        }

    # 5. 이전 주문 그대로 담기
    if _has_any(msg, ["지난번", "저번", "이전"]) and _has_any(msg, ["그대로", "다시", "또", "재주문"]):
        orders = await execute_tool("get_orders", {"session_id": session_id})
        order_list = orders.get("orders", []) if isinstance(orders, dict) else []

        if not order_list:
            return {
                "reply": "이전 주문 내역이 없어요. 메뉴를 새로 선택해주세요.",
                "components": [
                    {
                        "type": "OrderHistory",
                        "orders": [],
                    }
                ],
                "_fastPath": "reorder_empty",
            }

        latest_order = order_list[-1]
        order_id = latest_order.get("orderId")

        cart = await execute_tool(
            "reorder",
            {
                "session_id": session_id,
                "order_id": order_id,
            },
        )

        return {
            "reply": "지난 주문을 다시 장바구니에 담았습니다.",
            "components": [
                _ensure_component(cart, "Cart")
            ],
            "_fastPath": "reorder",
        }

    # 6. 결제 / 주문 확정
    if _has_any(msg, ["결제", "주문할게", "주문 할게", "주문확정", "주문 확정", "이대로 주문", "이대로 결제"]):
        cart = await execute_tool("get_cart", {"session_id": session_id})

        if not isinstance(cart, dict) or not cart.get("items"):
            return {
                "reply": "장바구니가 비어 있어요. 먼저 메뉴를 담아주세요.",
                "components": [
                    {
                        "type": "Cart",
                        "items": [],
                        "totalPrice": 0,
                    }
                ],
                "_fastPath": "checkout_empty",
            }

        order_type = "takeOut" if _has_any(msg, ["포장", "테이크아웃", "가져갈"]) else "dineIn"

        order = await execute_tool(
            "create_order",
            {
                "session_id": session_id,
                "orderType": order_type,
            },
        )

        if isinstance(order, dict) and order.get("type") == "OrderComplete":
            clear_session(session_id)

        return {
            "reply": "주문이 완료되었습니다.",
            "components": [
                _ensure_component(order, "OrderComplete")
            ],
            "_fastPath": "checkout",
        }

    return None


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword.lower() in text for keyword in keywords)


def _looks_complex(text: str) -> bool:
    """
    fast path로 처리하면 안 되는 복합 요청을 걸러낸다.
    이런 요청은 Gemini가 의도 분석을 해야 한다.
    """

    complex_keywords = [
        "추천",
        "비교",
        "칼로리",
        "알레르기",
        "들어가지 않은",
        "안 들어간",
        "없는",
        "빼고",
        "제외",
        "바꿔",
        "변경",
        "추가",
        "담아",
        "주세요",
        "세트",
        "버거",
        "사이드",
        "음료",
        "콜라",
        "사이다",
        "가격",
        "얼마",
        "가능",
        "조합",
        "예산",
    ]

    # 단순 조회 문장 예외
    simple_patterns = [
        "쿠폰 보여",
        "쿠폰 뭐",
        "쿠폰 조회",
        "프로모션 보여",
        "이벤트 보여",
        "할인 중",
        "장바구니 보여",
        "장바구니 확인",
        "주문 내역",
        "이전 주문",
    ]

    if any(pattern in text for pattern in simple_patterns):
        return False

    return any(keyword in text for keyword in complex_keywords)


def _ensure_component(data, component_type: str) -> dict:
    """
    Tool 결과가 이미 컴포넌트면 그대로 쓰고,
    아니면 type을 붙여서 컴포넌트 형태로 만든다.
    """

    if isinstance(data, dict):
        if data.get("type"):
            return data
        return {
            "type": component_type,
            **data,
        }

    if component_type == "PromotionBanner":
        return {
            "type": "PromotionBanner",
            "promotions": data if isinstance(data, list) else [],
        }

    if component_type == "CouponSelector":
        return {
            "type": "CouponSelector",
            "coupons": data if isinstance(data, list) else [],
        }

    if component_type == "OrderHistory":
        return {
            "type": "OrderHistory",
            "orders": data if isinstance(data, list) else [],
        }

    if component_type == "Cart":
        return {
            "type": "Cart",
            "items": [],
            "totalPrice": 0,
        }

    return {
        "type": component_type,
        "data": data,
    }


def _fix_json_text(final_text: str) -> str:
    """
    Gemini가 JSON을 살짝 망가뜨렸을 때 최소 보정한다.
    """

    final_text = (
        final_text
        .replace(": False", ": false").replace(": True", ": true")
        .replace(":False", ":false").replace(":True", ":true")
        .replace(", False", ", false").replace(", True", ", true")
        .replace("[False", "[false").replace("[True", "[true")
    )

    open_braces = final_text.count("{") - final_text.count("}")
    open_brackets = final_text.count("[") - final_text.count("]")

    if open_braces > 0 or open_brackets > 0:
        logger.warning(
            "JSON 잘림 감지 brace=%d, bracket=%d. 복구 시도.",
            open_braces,
            open_brackets,
        )

        last_complete = final_text.rfind('"soldOut": false}')
        if last_complete == -1:
            last_complete = final_text.rfind('"soldOut": true}')

        if last_complete != -1:
            cut_pos = last_complete + len('"soldOut": false}')
            final_text = final_text[:cut_pos] + "]}"
        else:
            final_text += "]" * open_brackets + "}" * open_braces

    return final_text


def _post_process(session_id: str, result: dict) -> None:
    component_types = {c.get("type") for c in result.get("components", [])}

    if "OrderComplete" in component_types:
        clear_session(session_id)
