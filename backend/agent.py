"""
agent.py — 에이전트 메인 로직
FastAPI 라우터에서 process_message() 만 호출하면 됩니다.
"""

import logging
import asyncio

from google import genai
from google.genai import types

from prompts import SYSTEM_PROMPT
from tools import TOOLS
from tool_executor import execute_tool
from session import get_history, append_user, append_model, clear_session
from parser import parse_and_validate
from utils import build_cart_response

GEMINI_MODEL = 'gemini-2.5-flash'
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
                logger.warning("[%s] Gemini API 쿼터 초과. 잠시 후 다시 시도해주세요.", session_id)
                return {"reply": "잠시 요청이 많아 처리가 지연되고 있습니다. 10초 후에 다시 시도해주세요.", "components": []}
            elif "503" in error_str or "UNAVAILABLE" in error_str:
                logger.warning("[%s] Gemini API 서버 과부하.", session_id)
                return {"reply": "AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.", "components": []}
            else:
                logger.error("[%s] Gemini API 오류: %s", session_id, e)
                return {"reply": "AI 응답 중 오류가 발생했습니다. 다시 시도해주세요.", "components": []}

        model_content = response.candidates[0].content
        logger.warning("[%s] finish_reason=%s", session_id, response.candidates[0].finish_reason)
        logger.warning("[%s] 응답길이=%d | 전문: %s", session_id, len(str(model_content)), str(model_content)[:1000])

        if not model_content or not model_content.parts:
            logger.warning(f"[{session_id}] Gemini returned empty parts")
            return {"reply": "죄송합니다. 응답을 생성하지 못했습니다. 다시 말씀해주세요.", "components": []}

        append_model(session_id, model_content)

        tool_call_parts = [p for p in model_content.parts if p.function_call]

        if not tool_call_parts:
            final_text = "".join(
                p.text for p in model_content.parts
                if hasattr(p, "text") and p.text
            )
            logger.debug("[%s] 최종 응답 수신 (len=%d)", session_id, len(final_text))

            final_text = (final_text
                .replace(": False", ": false").replace(": True", ": true")
                .replace(":False", ":false").replace(":True", ":true")
                .replace(", False", ", false").replace(", True", ", true")
                .replace("[False", "[false").replace("[True", "[true"))

            open_braces = final_text.count("{") - final_text.count("}")
            open_brackets = final_text.count("[") - final_text.count("]")

            if open_braces > 0 or open_brackets > 0:
                logger.warning("[%s] JSON 잘림 감지 (brace=%d, bracket=%d). 복구 시도.",
                               session_id, open_braces, open_brackets)
                last_complete = final_text.rfind('"soldOut": false}')
                if last_complete == -1:
                    last_complete = final_text.rfind('"soldOut": true}')
                if last_complete != -1:
                    cut_pos = last_complete + len('"soldOut": false}')
                    final_text = final_text[:cut_pos] + "]}"
                else:
                    final_text += "]" * open_brackets + "}" * open_braces

            result = parse_and_validate(final_text)

            # Cart 컴포넌트가 있으면 실제 백엔드 장바구니로 교체
            has_cart = any(c.get("type") == "Cart" for c in result.get("components", []))
            if has_cart:
                real_cart = build_cart_response(session_id)
                result["components"] = [
                    real_cart if c.get("type") == "Cart" else c
                    for c in result["components"]
                ]

            _post_process(session_id, result)
            return result

        # Tool 병렬 실행
        async def _run_tool(part) -> types.Part:
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}
            tool_args["session_id"] = session_id
            logger.info("[%s] Tool 실행: %s(%s)", session_id, fc.name, tool_args)
            tool_result = await execute_tool(fc.name, tool_args)
            logger.debug("[%s] Tool 결과: %s", session_id, str(tool_result)[:300])
            return types.Part.from_function_response(
                name=fc.name,
                response={"result": tool_result},
            )

        tool_result_parts = await asyncio.gather(*[_run_tool(p) for p in tool_call_parts])
        append_user(session_id, list(tool_result_parts))

    logger.error("[%s] Tool 루프 최대 반복(%d) 초과", session_id, MAX_TOOL_ROUNDS)
    return {
        "reply": "죄송합니다, 처리 중 문제가 발생했습니다. 다시 말씀해 주세요.",
        "components": [],
        "_error": "max_tool_rounds_exceeded",
    }


def _post_process(session_id: str, result: dict) -> None:
    component_types = {c.get("type") for c in result.get("components", [])}
    if "OrderComplete" in component_types:
        clear_session(session_id)
