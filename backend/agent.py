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

from google import genai
from google.genai import types

from prompts import SYSTEM_PROMPT
from tools import TOOLS
from tool_executor import execute_tool
from session import get_history, append_user, append_model, clear_session
from parser import parse_and_validate

GEMINI_MODEL = "gemini-2.0-flash"
MAX_TOOL_ROUNDS = 10   

logger = logging.getLogger(__name__)
_client = genai.Client()

_GENAI_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=TOOLS,
    temperature=0.2,            
    response_mime_type="text/plain",
)


async def process_message(session_id: str, user_message: str) -> dict:
    # 사용자 메시지를 히스토리에 추가
    append_user(session_id, [types.Part.from_text(text=user_message)])

    # Tool 루프
    for round_num in range(MAX_TOOL_ROUNDS):
        logger.debug("[%s] Gemini 호출 round=%d", session_id, round_num)

        response = _client.models.generate_content(
            model=GEMINI_MODEL,
            contents=get_history(session_id),   # 매 호출마다 전체 히스토리 전달
            config=_GENAI_CONFIG,
        )

        model_content = response.candidates[0].content

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

            result = parse_and_validate(final_text)
            _post_process(session_id, result)
            return result

        # Tool 실행
        tool_result_parts = []
        for part in tool_call_parts:
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}

            # session_id 자동 주입 (Gemini가 누락할 경우 대비)
            tool_args.setdefault("session_id", session_id)

            logger.info("[%s] Tool 실행: %s(%s)", session_id, fc.name, tool_args)
            tool_result = await execute_tool(fc.name, tool_args)
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
    return {
        "reply": "죄송합니다, 처리 중 문제가 발생했습니다. 다시 말씀해 주세요.",
        "components": [],
        "_error": "max_tool_rounds_exceeded",
    }


def _post_process(session_id: str, result: dict) -> None:
    component_types = {c.get("type") for c in result.get("components", [])}
    if "OrderComplete" in component_types:
        clear_session(session_id)