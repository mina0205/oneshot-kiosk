import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models import ChatRequest
from agent import process_message

router = APIRouter(prefix="/agent", tags=["에이전트"])


@router.post("/chat")
async def agent_chat(req: ChatRequest):
    result = await process_message(req.session_id, req.message)
    return result


# ★ SSE 스트리밍 엔드포인트 추가
# 프론트엔드가 /agent/chat/stream 을 호출하면,
# 처리 완료 즉시 SSE 이벤트로 결과를 내려줌으로써
# 응답 시작 지연 및 연결 타임아웃 문제를 해소.
@router.post("/chat/stream")
async def agent_chat_stream(req: ChatRequest):
    async def event_generator():
        try:
            result = await process_message(req.session_id, req.message)
            payload = json.dumps(result, ensure_ascii=False)
            yield f"data: {payload}\n\n"
        except Exception as e:
            error_payload = json.dumps(
                {"reply": "서버 오류가 발생했습니다.", "components": [], "_error": str(e)},
                ensure_ascii=False,
            )
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # nginx 프록시 버퍼링 비활성화
            "Connection": "keep-alive",
        },
    )