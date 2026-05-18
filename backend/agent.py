"""
agent.py — 에이전트 메인 로직
FastAPI 라우터에서 process_message() 만 호출하면 됩니다.

흐름:
  1) 사용자 메시지를 히스토리에 추가
  2) Gemini API 호출 (Tool 목록 + 시스템 프롬프트)
  3) Tool call 응답이면 → Tool 실행 → 결과를 히스토리에 추가 → 다시 Gemini 호출
  4) 텍스트 응답이 나오면 → A2UI JSON 파싱 후 반환
  5) OrderComplete 응답이면 세션 초기화
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

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
MAX_TOOL_ROUNDS = int(os.getenv("MAX_TOOL_ROUNDS", "6"))

logger = logging.getLogger(__name__)
_client = None

_GENAI_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=TOOLS,
    temperature=0.2,   
    max_output_tokens=int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "2048")),
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
    # 사용자 메시지를 히스토리에 추가
    append_user(session_id, [types.Part.from_text(text=user_message)])

    fast_result = _try_fast_menu_response(session_id, user_message, req_t0)
    if fast_result is not None:
        return fast_result

    # Tool 루프
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

        # None 안전 처리
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
                "components": []
            }
        
        # 모델 응답을 히스토리에 추가
        append_model(session_id, model_content)

        # Tool call 여부 확인
        tool_call_parts = [p for p in model_content.parts if p.function_call]

        # Tool call 없음 → 최종 텍스트 응답
        if not tool_call_parts:
            final_text = "".join(
                p.text for p in model_content.parts
                if hasattr(p, "text") and p.text
            )
            logger.debug("[%s] 최종 응답 수신 (len=%d)", session_id, len(final_text))

            # ── Python 불리언 → JSON 불리언 ──
            final_text = (final_text
                .replace(": False", ": false").replace(": True", ": true")
                .replace(":False", ":false").replace(":True", ":true")
                .replace(", False", ", false").replace(", True", ", true")
                .replace("[False", "[false").replace("[True", "[true"))

            # ── 잘린 JSON 복구 ──
            open_braces = final_text.count("{") - final_text.count("}")
            open_brackets = final_text.count("[") - final_text.count("]")

            if open_braces > 0 or open_brackets > 0:
                logger.warning("[%s] JSON 잘림 감지 (brace=%d, bracket=%d). 복구 시도.",
                               session_id, open_braces, open_brackets)

                # 마지막 완전한 MenuCard 객체까지만 유지
                last_complete = final_text.rfind('"soldOut": false}')
                if last_complete == -1:
                    last_complete = final_text.rfind('"soldOut": true}')

                if last_complete != -1:
                    cut_pos = last_complete + len('"soldOut": false}')
                    final_text = final_text[:cut_pos] + "]}"
                else:
                    # MenuCard가 아닌 경우 닫는 괄호만 추가
                    final_text += "]" * open_brackets + "}" * open_braces

            result = parse_and_validate(final_text)
            _post_process(session_id, result)
            logger.warning(
                "[%s] done total_ms=%.1f rounds=%d status=ok",
                session_id,
                (time.perf_counter() - req_t0) * 1000,
                round_num + 1,
            )
            return result


        # Tool 실행
        tool_result_parts = []
        for part in tool_call_parts:
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}

            # session_id 강제 주입 (Gemini가 임의 값을 넣는 것 방지)
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

        # Tool 결과를 히스토리에 추가 후 다시 Gemini 호출
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


def _post_process(session_id: str, result: dict) -> None:
    component_types = {c.get("type") for c in result.get("components", [])}
    if "OrderComplete" in component_types:
        clear_session(session_id)
