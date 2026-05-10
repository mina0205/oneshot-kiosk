import logging
from google.genai import types

logger = logging.getLogger(__name__)

_histories: dict[str, list[types.Content]] = {}


def get_history(session_id: str) -> list[types.Content]:
    return _histories.setdefault(session_id, [])

# 히스토리 먼저 호출
def append_user(session_id: str, parts: list) -> None:
    if session_id not in _histories:
        _histories[session_id] = []
    _histories[session_id].append(
        types.Content(role="user", parts=parts)
    )



def append_model(session_id: str, content: types.Content) -> None:
    _histories[session_id].append(content)


def clear_session(session_id: str) -> None:
    _histories.pop(session_id, None)
    logger.info("[%s] 세션 초기화 완료", session_id)