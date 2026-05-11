from fastapi import APIRouter
from models import ChatRequest
from agent import process_message

router = APIRouter(prefix="/agent", tags=["에이전트"])

@router.post("/chat")
async def agent_chat(req: ChatRequest):
    result = await process_message(req.session_id, req.message)
    return result
