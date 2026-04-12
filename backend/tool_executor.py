import logging
from typing import Any

import httpx

BACKEND_BASE = "http://localhost:8000"

logger = logging.getLogger(__name__)


async def _call_backend(method: str, path: str, **kwargs) -> dict:
    url = f"{BACKEND_BASE}{path}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await getattr(client, method)(url, **kwargs)
        resp.raise_for_status()
        return resp.json()


async def execute_tool(tool_name: str, args: dict) -> Any:
    try:
        sid = args.get("session_id", "")

        # ── 메뉴 조회 ─────────────────────────────────────────────

        if tool_name == "get_all_menus":
            params = {}
            if "category" in args:
                params["category"] = args["category"]
            return await _call_backend("get", "/menus", params=params)

        elif tool_name == "search_menus_by_condition":
            params = {k: v for k, v in args.items() if v is not None}
            return await _call_backend("get", "/menus/search", params=params)

        # ── 세트 옵션 ─────────────────────────────────────────────

        elif tool_name == "get_set_options":
            option_type = args.get("type")
            path = f"/set-options/{option_type}" if option_type else "/set-options"
            return await _call_backend("get", path)

        # ── 장바구니 ──────────────────────────────────────────────

        elif tool_name == "get_cart":
            return await _call_backend("get", f"/cart/{sid}")

        elif tool_name == "add_to_cart":
            body = {k: v for k, v in args.items() if k != "session_id" and v is not None}
            return await _call_backend("post", f"/cart/{sid}/items", json=body)

        elif tool_name == "update_cart_item":
            cart_item_id = args["cartItemId"]
            body = {
                k: v for k, v in args.items()
                if k not in ("session_id", "cartItemId") and v is not None
            }
            return await _call_backend("patch", f"/cart/{sid}/items/{cart_item_id}", json=body)

        elif tool_name == "delete_cart_item":
            cart_item_id = args["cartItemId"]
            return await _call_backend("delete", f"/cart/{sid}/items/{cart_item_id}")

        else:
            return {"error": f"알 수 없는 Tool: {tool_name}"}

    except httpx.HTTPStatusError as e:
        logger.error("BE API 오류 [%s %s]: %s", tool_name, args, e)
        return {"error": f"API 오류 ({e.response.status_code}): {e.response.text}"}
    except Exception as e:
        logger.error("Tool 실행 오류 [%s]: %s", tool_name, e)
        return {"error": str(e)}