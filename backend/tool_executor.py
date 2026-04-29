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

        elif tool_name == "get_menu_detail":
            menu_id = args["menuId"]
            return await _call_backend("get", f"/menus/{menu_id}")

        # ── 세트 옵션 / 토핑 ──────────────────────────────────────

        elif tool_name == "get_set_options":
            option_type = args.get("type")
            path = f"/set-options/{option_type}" if option_type else "/set-options"
            return await _call_backend("get", path)

        elif tool_name == "get_toppings":
            return await _call_backend("get", "/set-options/toppings")

        # ── 장바구니 ──────────────────────────────────────────────
        elif tool_name == "add_to_cart":
            body = {k: v for k, v in args.items() if k != "session_id" and v is not None}

            # ── 사이드/음료 검증 ──
            for field, option_type in [("selectedSide", "sides"), ("selectedDrink", "drinks")]:
                val = body.get(field, "")
                if not val:
                    continue
                try:
                    options = await _call_backend("get", f"/set-options/{option_type}")
                    valid_names = [opt["name"] for opt in options]

                    # ID로 들어온 경우 이름으로 변환
                    if val.startswith("side-") or val.startswith("drink-"):
                        for opt in options:
                            if opt.get("optionId") == val:
                                body[field] = opt["name"]
                                break
                        else:
                            return {"error": f"'{val}'은(는) 존재하지 않는 옵션입니다. 가능: {', '.join(valid_names)}"}
                    # 이름이 정확히 일치하지 않는 경우 거부
                    elif val not in valid_names:
                        return {
                            "error": f"'{val}'은(는) 선택할 수 없는 옵션입니다. "
                                    f"선택 가능: {', '.join(valid_names)}"
                        }
                except Exception as ex:
                    logger.warning("옵션 검증 실패 [%s]: %s", field, ex)

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

        # ── 주문 이력 / 리오더 (S-06) ─────────────────────────────

        elif tool_name == "get_orders":
            return await _call_backend("get", f"/orders/{sid}")

        elif tool_name == "reorder":
            order_id = args["order_id"]
            return await _call_backend("post", f"/orders/{sid}/reorder/{order_id}")

        # ── 프로모션 / 쿠폰 (S-09) ────────────────────────────────

        elif tool_name == "get_promotions":
            menu_id = args.get("menu_id")
            if menu_id:
                return await _call_backend("get", f"/promotions/{menu_id}")
            return await _call_backend("get", "/promotions")

        elif tool_name == "get_coupons":
            return await _call_backend("get", "/coupons", params={"session_id": sid})

        # ── 주문 확정 (S-10) ──────────────────────────────────────

        elif tool_name == "create_order":
            body = {"orderType": args["orderType"]}
            if args.get("couponId"):
                body["couponId"] = args["couponId"]
            return await _call_backend("post", f"/orders/{sid}", json=body)

        # ── 알 수 없는 Tool ───────────────────────────────────────

        else:
            return {"error": f"알 수 없는 Tool: {tool_name}"}

    except httpx.HTTPStatusError as e:
        logger.error("BE API 오류 [%s %s]: %s", tool_name, args, e)
        return {"error": f"API 오류 ({e.response.status_code}): {e.response.text}"}
    except Exception as e:
        logger.error("Tool 실행 오류 [%s]: %s", tool_name, e)
        return {"error": str(e)}
