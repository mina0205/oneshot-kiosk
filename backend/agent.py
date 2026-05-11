"""
agent.py — 에이전트 메인 로직

최적화 포인트:
- 쿠폰, 프로모션, 장바구니, 주문내역, 결제 같은 고정 요청은 Gemini를 거치지 않고 바로 처리한다.
- 복잡한 자연어 주문, 추천, 비교, 커스텀 주문만 Gemini로 보낸다.
"""

import logging
import re

from google import genai
from google.genai import types

from prompts import SYSTEM_PROMPT
from tools import TOOLS
from tool_executor import execute_tool
from session import get_history, append_user, append_model, clear_session
from parser import parse_and_validate

GEMINI_MODEL = "gemini-2.5-flash"
MAX_TOOL_ROUNDS = 10

logger = logging.getLogger(__name__)
_client = genai.Client()

_GENAI_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=TOOLS,
    temperature=0.2,
    max_output_tokens=4096,
    response_mime_type="text/plain",
)


async def process_message(session_id: str, user_message: str) -> dict:
    # 1. 고정 요청은 Gemini 호출 전에 바로 처리
    fast_result = await _try_fast_path(session_id, user_message)
    if fast_result is not None:
        return fast_result

    # 2. 여기부터는 복잡한 요청만 Gemini 사용
    append_user(session_id, [types.Part.from_text(text=user_message)])

    for round_num in range(MAX_TOOL_ROUNDS):
        logger.debug("[%s] Gemini 호출 round=%d", session_id, round_num)

        try:
            response = _client.models.generate_content(
                model=GEMINI_MODEL,
                contents=get_history(session_id),
                config=_GENAI_CONFIG,
            )
        except Exception as e:
            error_str = str(e)

            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                logger.warning("[%s] Gemini API 쿼터 초과", session_id)
                return {
                    "reply": "잠시 요청이 많아 처리가 지연되고 있습니다. 10초 후에 다시 시도해주세요.",
                    "components": [],
                }

            if "503" in error_str or "UNAVAILABLE" in error_str:
                logger.warning("[%s] Gemini API 서버 과부하", session_id)
                return {
                    "reply": "AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.",
                    "components": [],
                }

            logger.error("[%s] Gemini API 오류: %s", session_id, e)
            return {
                "reply": "AI 응답 중 오류가 발생했습니다. 다시 시도해주세요.",
                "components": [],
            }

        model_content = response.candidates[0].content

        logger.warning("[%s] finish_reason=%s", session_id, response.candidates[0].finish_reason)
        logger.warning("[%s] 응답길이=%d | 전문: %s", session_id, len(str(model_content)), str(model_content)[:1000])

        if not model_content or not model_content.parts:
            logger.warning("[%s] Gemini returned empty parts", session_id)
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
            return result

        tool_result_parts = []

        for part in tool_call_parts:
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}

            tool_args["session_id"] = session_id

            logger.info("[%s] Tool 실행: %s(%s)", session_id, fc.name, tool_args)
            tool_result = await execute_tool(fc.name, tool_args)
            logger.debug("[%s] Tool 결과: %s", session_id, str(tool_result)[:300])

            tool_result_parts.append(
                types.Part.from_function_response(
                    name=fc.name,
                    response={"result": tool_result},
                )
            )

        append_user(session_id, tool_result_parts)

    logger.error("[%s] Tool 루프 최대 반복 초과", session_id)

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