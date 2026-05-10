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

import logging
import asyncio

from google import genai
from google.genai import types

from prompts import SYSTEM_PROMPT
from tools import TOOLS
from tool_executor import execute_tool
from session import get_history, append_user, append_model, clear_session
from parser import parse_and_validate

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

# Python 불리언 → JSON 불리언 변환 테이블 (미리 빌드)
_BOOL_REPLACEMENTS = [
    (": False", ": false"), (": True", ": true"),
    (":False", ":false"), (":True", ":true"),
    (", False", ", false"), (", True", ", true"),
    ("[False", "[false"), ("[True", "[true"),
]


def _fix_booleans(text: str) -> str:
    for old, new in _BOOL_REPLACEMENTS:
        text = text.replace(old, new)
    return text


async def process_message(session_id: str, user_message: str) -> dict:
    # 사용자 메시지를 히스토리에 추가
    append_user(session_id, [types.Part.from_text(text=user_message)])

    # Tool 루프
    for round_num in range(MAX_TOOL_ROUNDS):
        logger.debug("[%s] Gemini 호출 round=%d", session_id, round_num)

        try:
            # ★ 동기 generate_content → 비동기 generate_content_async 로 변경
            response = await _client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=get_history(session_id),
                config=_GENAI_CONFIG,
            )
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                logger.warning("[%s] Gemini API 쿼터 초과.", session_id)
                return {
                    "reply": "잠시 요청이 많아 처리가 지연되고 있습니다. 10초 후에 다시 시도해주세요.",
                    "components": [],
                }
            elif "503" in error_str or "UNAVAILABLE" in error_str:
                logger.warning("[%s] Gemini API 서버 과부하.", session_id)
                return {
                    "reply": "AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.",
                    "components": [],
                }
            else:
                logger.error("[%s] Gemini API 오류: %s", session_id, e)
                return {
                    "reply": "AI 응답 중 오류가 발생했습니다. 다시 시도해주세요.",
                    "components": [],
                }

        model_content = response.candidates[0].content
        # ★ logger.warning → logger.debug 로 강등 (매 round 전체 응답 str 변환 제거)
        logger.debug("[%s] finish_reason=%s", session_id, response.candidates[0].finish_reason)

        # None 안전 처리
        if not model_content or not model_content.parts:
            logger.warning("[%s] Gemini returned empty parts", session_id)
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

            final_text = _fix_booleans(final_text)

            # ── 잘린 JSON 복구 ──
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
            _post_process(session_id, result)
            return result

        # ★ 병렬 Tool 실행: 여러 tool call을 asyncio.gather로 동시에 실행
        async def _run_tool(part):
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}
            tool_args["session_id"] = session_id
            logger.info("[%s] Tool 실행: %s(%s)", session_id, fc.name, tool_args)
            result = await execute_tool(fc.name, tool_args)
            logger.debug("[%s] Tool 결과: %s", session_id, str(result)[:300])
            return types.Part.from_function_response(
                name=fc.name,
                response={"result": result},
            )

        tool_result_parts = await asyncio.gather(*[_run_tool(p) for p in tool_call_parts])

        # Tool 결과를 히스토리에 추가 후 다시 Gemini 호출
        append_user(session_id, list(tool_result_parts))

    # MAX_TOOL_ROUNDS 초과 — 안전 fallback
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