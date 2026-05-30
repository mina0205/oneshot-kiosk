"""
agent.py — 에이전트 메인 로직

시나리오별 성능 (Gemini 2.5-flash 기준, 개선 전 → 개선 후)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tier 0  in-memory · Gemini 0회 · HTTP 0회  (~1 ms)
  S-02  조건 메뉴 (칼로리/카테고리/가격)    fast_menu      기존: 2500ms
  S-04  알레르기/식이제한 필터             fast_allergy   기존: 3000ms
  S-05  예산 조합 추천                    fast_budget    기존: 5000ms
  S-07  메뉴 비교                        fast_compare   기존: 4000ms
  S-09  쿠폰/프로모션 (in-memory 전환)    fast_path      기존:    5ms
  S-10  커스텀 빌더 (메뉴 명시 시)        fast_custom    기존: 4000ms

Tier 1  Gemini 0회 · HTTP 1-2회  (~10 ms)
  S-06  재주문 / 장바구니 / 결제 조회     fast_path

Tier 2  Gemini 필요  (~1500–6000 ms)
  S-01  단체 주문 일괄 처리
  S-03  주문 중간 수정
  S-08  다국어 즉시 주문
  자연어 복합 주문
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
from __future__ import annotations

import json
import logging
import os
import re
import time

from google import genai
from google.genai import types

from data_loader import menus, set_options
from data_loader import promotions as _promotions_data
from data_loader import coupons as _coupons_data
from prompts import SYSTEM_PROMPT
from tools import TOOLS
from tool_executor import execute_tool
from session import get_history, append_user, append_model, clear_session
from parser import parse_and_validate
from store import carts
from utils import build_cart_response

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_TOOL_ROUNDS = int(os.getenv("MAX_TOOL_ROUNDS", "10"))

logger = logging.getLogger(__name__)
_client = None

_GENAI_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=TOOLS,
    temperature=0.2,
    max_output_tokens=int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "4096")),
    response_mime_type="text/plain",
)

# google-genai 내부 lazy init을 모듈 로드 시점에 완료 (~2초 절감)
_WARMUP_PART = types.Part.from_text(text="")
_WARMUP_CONTENT = types.Content(role="user", parts=[_WARMUP_PART])


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        print(f"[DEBUG] Gemini API Key 로드: {api_key[:10] if api_key else 'None'}...")
        _client = genai.Client(api_key=api_key)
    return _client



# ── 분류 키워드 ──────────────────────────────────────────────────────────────

_CATEGORY_KEYWORDS = {
    "burger": ("burger", "버거"),
    "chicken": ("chicken", "치킨", "치남"),
    "side": ("side", "사이드", "감자", "너겟"),
    "drink": ("drink", "음료", "콜라", "커피"),
    "iceshot": ("iceshot", "아이스", "선데"),
}

_MENU_INTENT_KEYWORDS = ("메뉴", "추천", "보여", "찾아", "알려", "menu", "recommend")
_NON_MENU_FAST_PATH_KEYWORDS = (
    "담아", "추가", "주문", "결제", "장바구니", "수정", "삭제", "쿠폰", "프로모션",
)
_CART_MUTATION_KEYWORDS = (
    "담아", "추가", "주문", "결제", "취소", "삭제", "빼줘", "변경", "수정",
)

# S-04 알레르기
_ALLERGEN_MAP: dict[str, str] = {
    "땅콩": "땅콩", "견과류": "견과류",
    "우유": "우유", "유제품": "우유",
    "달걀": "달걀", "계란": "달걀", "에그": "달걀",
    "밀": "밀", "글루텐": "밀",
    "대두": "대두", "콩": "대두",
    "새우": "새우",
    "조개": "조개류",
    "생선": "생선",
    "쇠고기": "쇠고기", "소고기": "쇠고기",
    "돼지고기": "돼지고기", "돼지": "돼지고기",
    "닭고기": "닭고기", "닭": "닭고기",
    "토마토": "토마토",
}
_ALLERGY_CONTEXT = (
    "알레르기", "알러지", "못 먹", "못먹", "없는", "안 들어간", "안들어간",
    "제외", "빼고", "없이", "민감", "불가",
)

# S-07 비교
_COMPARISON_KEYWORDS = (
    "비교", " vs ", "vs.", "차이", "뭐가 더", "뭐가 나아",
    "어떤 게", "어떤게", "어느 게", "어느게",
)

# S-05 예산
_BUDGET_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*(만원|원)", re.IGNORECASE)
_HEADCOUNT_PATTERN = re.compile(r"(\d+|[한두세네다섯여섯일곱여덟아홉열])\s*(명|인|분)")
_KO_NUM = {
    "한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5,
    "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10,
}
_BUDGET_CONTEXT = ("예산", "이하로", "이내로", "안에서", "으로 먹", "로 먹을")

# S-10 커스텀 빌더
_CUSTOM_KEYWORDS = (
    "커스텀", "customize", "직접 만들", "맞춤", "토핑 추가해줘", "토핑 올려", "토핑 넣어",
)

# S-01 단체 주문
_BULK_ORDER_INTENT_KEYWORDS = (
    "주세요", "줘", "담아", "주문", "추가", "올려", "넣어", "시킬게", "먹을게", "먹을거",
)

# S-03 주문 수정
_DELETE_KEYWORDS = ("빼줘", "빼 줘", "삭제", "취소해줘", "없애줘", "제거")
_QTY_CHANGE_KEYWORDS = ("개로 바꿔", "개로 변경", "개로 수정", "개로 줄여", "개로 늘려", "개로 해줘")
_ORDINAL_MAP = {
    "첫번째": 0, "첫 번째": 0, "1번": 0,
    "두번째": 1, "두 번째": 1, "2번": 1,
    "세번째": 2, "세 번째": 2, "3번": 2,
}

# S-08 다국어 (영어) — 키워드 길이 내림차순 (긴 키워드 우선 매칭)
_EN_MENU_TABLE: list[tuple[str, str]] = sorted([
    # burger-009: 리아 새우 베이컨
    ("ria shrimp bacon burger", "burger-009"), ("ria shrimp bacon", "burger-009"),
    ("shrimp bacon burger", "burger-009"),
    # burger-004: 핫크리스피치킨버거
    ("hot crispy chicken burger", "burger-004"), ("hot crispy chicken", "burger-004"),
    ("crispy chicken burger", "burger-004"), ("hot crispy", "burger-004"),
    ("spicy crispy burger", "burger-004"),
    # burger-003: 한우불고기버거
    ("wagyu bulgogi burger", "burger-003"), ("korean beef burger", "burger-003"),
    ("wagyu beef burger", "burger-003"), ("wagyu burger", "burger-003"),
    ("hanwoo burger", "burger-003"), ("wagyu", "burger-003"), ("hanwoo", "burger-003"),
    # burger-007: 클래식치즈버거
    ("classic cheeseburger", "burger-007"), ("classic cheese burger", "burger-007"),
    ("classic cheese", "burger-007"), ("cheeseburger", "burger-007"),
    ("cheese burger", "burger-007"),
    # burger-008: 리아 새우
    ("ria shrimp burger", "burger-008"), ("shrimp burger", "burger-008"),
    ("ria shrimp", "burger-008"), ("shrimp", "burger-008"),
    # burger-001: 리아 불고기
    ("ria bulgogi burger", "burger-001"), ("bulgogi burger", "burger-001"),
    ("ria bulgogi", "burger-001"), ("bulgogi", "burger-001"),
    # burger-002: 데리버거
    ("teriyaki burger", "burger-002"), ("teri burger", "burger-002"),
    ("teriyaki", "burger-002"), ("teri", "burger-002"), ("deri burger", "burger-002"),
    # burger-005: NEW 미라클버거
    ("miracle burger", "burger-005"), ("plant based burger", "burger-005"),
    ("vegan burger", "burger-005"), ("miracle", "burger-005"),
    # burger-006: 치킨버거
    ("chicken burger", "burger-006"),
    # chicken-003: 치킨너겟
    ("chicken nuggets", "chicken-003"), ("6 nuggets", "chicken-003"),
    ("nuggets", "chicken-003"),
    # chicken-001: 후라이드치킨
    ("fried chicken", "chicken-001"), ("original chicken", "chicken-001"),
    ("classic chicken", "chicken-001"), ("plain chicken", "chicken-001"),
    # chicken-002: 양념치킨
    ("sweet and spicy chicken", "chicken-002"), ("sweet spicy chicken", "chicken-002"),
    ("yangnyeom chicken", "chicken-002"), ("seasoned chicken", "chicken-002"),
    ("spicy chicken", "chicken-002"),
    # side-101: 포테이토(단품L)
    ("french fries", "side-101"), ("large fries", "side-101"),
    ("potato fries", "side-101"), ("fries", "side-101"), ("potato", "side-101"),
    # side-102: 치즈스틱(단품)
    ("mozzarella sticks", "side-102"), ("cheese sticks", "side-102"),
    ("mozzarella stick", "side-102"), ("cheese stick", "side-102"),
    # side-103: 통오징어링(단품)
    ("squid rings", "side-103"), ("calamari rings", "side-103"),
    ("squid ring", "side-103"), ("calamari", "side-103"),
    # drink-102: 제로슈거콜라(단품R)
    ("zero sugar cola", "drink-102"), ("zero sugar coke", "drink-102"),
    ("diet coke", "drink-102"), ("zero cola", "drink-102"),
    ("diet cola", "drink-102"), ("zero coke", "drink-102"),
    # drink-101: 펩시콜라(단품R)
    ("pepsi cola", "drink-101"), ("pepsi", "drink-101"),
    ("cola", "drink-101"), ("coke", "drink-101"),
    # drink-103: 아이스아메리카노(단품R)
    ("iced americano", "drink-103"), ("iced coffee", "drink-103"),
    ("cold brew", "drink-103"), ("americano", "drink-103"),
    # iceshot-001: 초코선데
    ("chocolate sundae", "iceshot-001"), ("choco sundae", "iceshot-001"),
    ("sundae", "iceshot-001"),
    # iceshot-002: 딸기선데
    ("strawberry sundae", "iceshot-002"),
], key=lambda x: -len(x[0]))

_EN_ORDER_INTENT = (
    "i want", "i'd like", "i would like", "give me", "can i get", "could i get",
    "i'll have", "i will have", "please", "get me", "i need", "let me have",
    "order", "add to cart", "add",
)
_EN_QTY_WORDS = {
    "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}


# ── 수량 추출 헬퍼 ───────────────────────────────────────────────────────────

_KO_QTY = {
    "한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5,
    "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10,
}
_QTY_PATTERN = re.compile(r"(\d+)[개잔그릇인분]")
_KO_QTY_PATTERN = re.compile(r"([한두세네다섯여섯일곱여덟아홉열])[개잔그릇인분]")


def _extract_quantity_near_menu(text: str, menu_name: str) -> int:
    """메뉴명 뒤 15자 범위에서 수량을 추출한다. 없으면 1."""
    name_ns = menu_name.replace(" ", "")
    text_ns = text.replace(" ", "")
    pos = text_ns.find(name_ns)
    if pos == -1:
        return 1
    after = text_ns[pos + len(name_ns): pos + len(name_ns) + 15]
    m = _KO_QTY_PATTERN.search(after)
    if m:
        return _KO_QTY.get(m.group(1), 1)
    m = _QTY_PATTERN.search(after)
    return int(m.group(1)) if m else 1


def _extract_quantity_from_any(text: str) -> int:
    """텍스트 전체에서 수량을 추출한다. 없으면 1."""
    m = _KO_QTY_PATTERN.search(text)
    if m:
        return _KO_QTY.get(m.group(1), 1)
    m = _QTY_PATTERN.search(text)
    return int(m.group(1)) if m else 1


def _is_english_message(text: str) -> bool:
    """메시지가 영어로 작성됐는지 판단한다 (ASCII 알파벳 비율 기준)."""
    text_clean = text.replace(" ", "")
    if not text_clean:
        return False
    ascii_alpha = sum(1 for c in text_clean if c.isascii() and c.isalpha())
    return ascii_alpha / len(text_clean) > 0.6


def _extract_en_qty_before(text: str, keyword_pos: int) -> int:
    """키워드 등장 위치 앞 15자에서 영어/숫자 수량을 추출한다."""
    before = text[max(0, keyword_pos - 15): keyword_pos].strip()
    m = re.search(r"(\d+)\s*$", before)
    if m:
        return int(m.group(1))
    for word in reversed(before.split()):
        val = _EN_QTY_WORDS.get(word.lower())
        if val:
            return val
    return 1


def _find_en_menu_items(text: str) -> list[dict]:
    """
    영어 텍스트에서 _EN_MENU_TABLE로 메뉴와 수량을 추출한다.
    긴 키워드 우선 매칭 (테이블이 길이 내림차순으로 정렬됨).
    """
    lowered = text.lower()
    found = []
    seen_ids: set[str] = set()

    for keyword, menu_id in _EN_MENU_TABLE:
        if menu_id in seen_ids:
            continue
        pos = lowered.find(keyword)
        if pos == -1:
            continue
        menu = next((m for m in menus if m["menuId"] == menu_id), None)
        if not menu:
            continue
        qty = _extract_en_qty_before(lowered, pos)
        found.append({"menu": menu, "quantity": qty})
        seen_ids.add(menu_id)

    return found


# ── in-memory 데이터 빌더 ────────────────────────────────────────────────────

def _build_coupons_fast(session_id: str) -> dict:
    total_price = 0
    if session_id and session_id in carts:
        total_price = build_cart_response(session_id)["totalPrice"]
    return {
        "type": "CouponSelector",
        "coupons": [{**c, "isApplicable": total_price >= c["minOrderPrice"]} for c in _coupons_data],
        "selectedCouponId": None,
    }


def _build_promotions_fast() -> list:
    return [p for p in _promotions_data if p["isActive"]]


# ── 컴포넌트 빌더 ────────────────────────────────────────────────────────────

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


def _comparison_entry(menu: dict) -> dict:
    nut = menu.get("nutrition", {})
    return {
        "menuId": menu.get("menuId"),
        "name": menu.get("name"),
        "image": menu.get("image"),
        "price": menu.get("price"),
        "setPrice": menu.get("setPrice"),
        "calories": menu.get("calories"),
        "protein": nut.get("protein", 0),
        "sodium": nut.get("sodium", 0),
        "sugar": nut.get("sugar", 0),
        "saturatedFat": nut.get("saturatedFat", 0),
        "allergens": menu.get("allergens", []),
    }


# ── 파싱 헬퍼 ────────────────────────────────────────────────────────────────

def _extract_max_number(message: str, units: tuple[str, ...]) -> int | None:
    unit_pattern = "|".join(re.escape(u) for u in units)
    matches = re.findall(r"(\d+(?:\.\d+)?)\s*(%s)" % unit_pattern, message, re.IGNORECASE)
    if not matches:
        return None
    value, unit = matches[0]
    number = float(value)
    if unit == "만원":
        number *= 10000
    return int(number)


def _parse_budget(message: str) -> int | None:
    m = _BUDGET_PATTERN.search(message)
    if not m:
        return None
    value, unit = m.group(1), m.group(2)
    amount = float(value) * (10000 if unit == "만원" else 1)
    return int(amount)


def _parse_headcount(message: str) -> int:
    m = _HEADCOUNT_PATTERN.search(message)
    if not m:
        return 1
    tok = m.group(1)
    return int(tok) if tok.isdigit() else _KO_NUM.get(tok, 1)


def _detect_category(lowered: str) -> str | None:
    for cat, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in lowered for kw in keywords):
            return cat
    return None


def _find_menus_in_text(text: str) -> list[dict]:
    """텍스트에서 메뉴명을 길이 내림차순으로 매칭해 반환한다.
    "(단품)", "(단품L)", "(단품R)", "(6pcs)" 등 괄호 접미사를 제거한 이름으로도 매칭한다.
    """
    found, seen = [], set()
    text_ns = text.replace(" ", "")
    for menu in sorted(menus, key=lambda m: -len(m["name"])):
        if menu["menuId"] in seen:
            continue
        name_ns = menu["name"].replace(" ", "")
        # 1차: 전체 이름 매칭
        if name_ns in text_ns:
            found.append(menu)
            seen.add(menu["menuId"])
            continue
        # 2차: "(단품)", "(단품L)", "(단품R)", "(6pcs)" 등 괄호 접미사 제거 후 매칭
        name_stripped = re.sub(r"\(.*?\)", "", name_ns)
        if name_stripped and name_stripped in text_ns:
            found.append(menu)
            seen.add(menu["menuId"])
    return found


# ── 공용 로깅 헬퍼 ───────────────────────────────────────────────────────────

def _commit_fast_result(session_id: str, result: dict, req_t0: float, status: str) -> None:
    append_model(
        session_id,
        types.Content(role="model", parts=[types.Part.from_text(text=json.dumps(result, ensure_ascii=False))]),
    )
    logger.warning(
        "[%s] done total_ms=%.1f rounds=0 status=%s",
        session_id, (time.perf_counter() - req_t0) * 1000, status,
    )


# ── Tier 0: in-memory 완결 처리 ──────────────────────────────────────────────

def _try_fast_menu_response(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-02: 칼로리/카테고리/가격/알레르기 조건 메뉴 필터"""
    get_history(session_id)
    lowered = user_message.lower()

    if any(kw in lowered for kw in _NON_MENU_FAST_PATH_KEYWORDS):
        return None
    if not any(kw in lowered for kw in _MENU_INTENT_KEYWORDS):
        return None

    category = _detect_category(lowered)
    max_calories = _extract_max_number(lowered, ("kcal", "칼로리"))
    max_price = _extract_max_number(lowered, ("원", "만원"))
    exclude_allergens = {_ALLERGEN_MAP[w] for w in _ALLERGEN_MAP if w in lowered}

    if category is None and max_calories is None and max_price is None and not exclude_allergens:
        return None

    filtered = menus
    if category:
        filtered = [m for m in filtered if m.get("category") == category]
    if max_calories is not None:
        filtered = [m for m in filtered if m.get("calories", 0) <= max_calories]
    if max_price is not None:
        filtered = [m for m in filtered if m.get("price", 0) <= max_price]
    if exclude_allergens:
        filtered = [m for m in filtered if not any(a in m.get("allergens", []) for a in exclude_allergens)]

    filtered = sorted(filtered, key=lambda m: (not m.get("isBestSeller", False), m.get("price", 0)))
    cards = [_menu_card(m) for m in filtered[:3]]

    components: list[dict] = []
    if exclude_allergens and any(w in lowered for w in _ALLERGY_CONTEXT):
        components.append({
            "type": "AllergyBanner",
            "allergens": list(exclude_allergens),
            "message": f"{', '.join(exclude_allergens)} 알레르기 성분을 제외한 메뉴예요.",
            "filteredCount": len(filtered),
        })
    components.extend(cards)

    result = {
        "reply": f"조건에 맞는 메뉴 {len(cards)}개를 보여드릴게요." if cards else "조건에 맞는 메뉴를 찾지 못했어요.",
        "components": components,
    }
    _commit_fast_result(session_id, result, req_t0, "fast_menu")
    return result


def _try_fast_allergy_response(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-04: 알레르기/식이제한 필터 — 메뉴 의도 키워드 없어도 작동"""
    lowered = user_message.lower()

    if not any(w in lowered for w in _ALLERGY_CONTEXT):
        return None
    if any(kw in lowered for kw in _CART_MUTATION_KEYWORDS):
        return None

    found_allergens = {_ALLERGEN_MAP[w] for w in _ALLERGEN_MAP if w in lowered}
    if not found_allergens:
        return None

    category = _detect_category(lowered)
    filtered = [
        m for m in menus
        if not any(a in m.get("allergens", []) for a in found_allergens)
        and (category is None or m.get("category") == category)
    ]
    filtered = sorted(filtered, key=lambda m: (not m.get("isBestSeller", False), m.get("price", 0)))
    cards = [_menu_card(m) for m in filtered[:3]]

    names = ", ".join(found_allergens)
    result = {
        "reply": f"{names} 알레르기 성분이 없는 메뉴 {len(cards)}개를 추천드릴게요.",
        "components": [
            {
                "type": "AllergyBanner",
                "allergens": list(found_allergens),
                "message": f"{names} 알레르기 성분을 제외했어요.",
                "filteredCount": len(filtered),
            },
            *cards,
        ],
    }
    _commit_fast_result(session_id, result, req_t0, "fast_allergy")
    return result


def _try_fast_comparison_response(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-07: 메뉴 비교 — 메시지에 메뉴명 2개 이상 있어야 작동"""
    lowered = user_message.lower()

    if not any(kw in lowered for kw in _COMPARISON_KEYWORDS):
        return None

    found = _find_menus_in_text(user_message)
    if len(found) < 2:
        return None

    a, b = found[0], found[1]
    result = {
        "reply": f"{a['name']}와 {b['name']}을 비교해드릴게요.",
        "components": [{"type": "ComparisonTable", "menus": [_comparison_entry(a), _comparison_entry(b)]}],
    }
    _commit_fast_result(session_id, result, req_t0, "fast_compare")
    return result


def _compute_combos(budget: int, headcount: int) -> list[dict]:
    candidates = [m for m in menus if m["category"] in ("burger", "chicken") and not m.get("soldOut")]
    by_price = sorted(candidates, key=lambda m: m["price"])
    bestsellers = [m for m in by_price if m.get("isBestSeller")]
    per = budget // headcount

    def _make(combo_id: str, label: str, items: list[dict]) -> dict | None:
        total = sum(m["price"] for m in items)
        if total > budget:
            return None
        return {
            "comboId": combo_id,
            "label": label,
            "items": [{"name": m["name"], "price": m["price"]} for m in items],
            "totalPrice": total,
            "remaining": budget - total,
        }

    combos: list[dict] = []
    seen_item_sets: list[list] = []

    affordable = [m for m in by_price if m["price"] <= per]
    if len(affordable) >= headcount:
        items = affordable[:headcount]
        c = _make("combo-1", "알뜰 조합", items)
        if c:
            combos.append(c)
            seen_item_sets.append(items)

    best = [m for m in bestsellers if m["price"] <= per]
    if len(best) >= headcount:
        items = best[:headcount]
        if items not in seen_item_sets:
            c = _make("combo-2", "베스트셀러 조합", items)
            if c:
                combos.append(c)
                seen_item_sets.append(items)

    if headcount >= 2:
        for premium in sorted(candidates, key=lambda m: -m["price"]):
            rem = budget - premium["price"]
            rest = [
                m for m in by_price
                if m["price"] <= rem // (headcount - 1) and m["menuId"] != premium["menuId"]
            ]
            if len(rest) >= headcount - 1:
                items = [premium] + rest[:headcount - 1]
                if items not in seen_item_sets:
                    c = _make("combo-3", "프리미엄 믹스", items)
                    if c:
                        combos.append(c)
                        break

    return combos[:3]


def _try_fast_budget_response(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-05: 예산 조합 추천 — 인원수 또는 예산 문맥 명시 필요"""
    lowered = user_message.lower()

    budget = _parse_budget(lowered)
    if budget is None:
        return None

    has_headcount = bool(_HEADCOUNT_PATTERN.search(lowered))
    has_budget_ctx = any(kw in lowered for kw in _BUDGET_CONTEXT)
    if not has_headcount and not has_budget_ctx:
        return None
    if any(kw in lowered for kw in _CART_MUTATION_KEYWORDS):
        return None

    headcount = _parse_headcount(lowered)
    combos = _compute_combos(budget, headcount)
    if not combos:
        return None

    bstr = f"{budget // 10000}만원" if budget >= 10000 and budget % 10000 == 0 else f"{budget:,}원"
    result = {
        "reply": f"{bstr} 예산으로 {headcount}명이 드실 수 있는 조합을 추천드릴게요.",
        "components": [{"type": "ComboRecommendation", "budget": budget, "headcount": headcount, "combos": combos}],
    }
    _commit_fast_result(session_id, result, req_t0, "fast_budget")
    return result


def _try_fast_custom_builder(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-10: 커스텀 빌더 초기 표시 — 베이스 메뉴명 명시 필요"""
    lowered = user_message.lower()

    if not any(kw in lowered for kw in _CUSTOM_KEYWORDS):
        return None

    found = _find_menus_in_text(user_message)
    if not found:
        return None

    base = found[0]
    toppings = set_options.get("toppings", [])
    result = {
        "reply": f"{base['name']} 커스텀 빌더를 열었어요. 추가할 토핑을 선택해주세요.",
        "components": [{
            "type": "CustomBuilder",
            "baseMenu": {"menuId": base["menuId"], "name": base["name"], "image": base.get("image", "")},
            "currentToppings": [
                {"name": t["name"], "isOriginal": False, "isAdded": False, "isRemoved": False, "price": t["price"]}
                for t in toppings
            ],
            "additionalPrice": 0,
        }],
    }
    _commit_fast_result(session_id, result, req_t0, "fast_custom")
    return result


# ── Tier 1b: 단순 주문/수정 (HTTP 필요, Gemini 0회) ─────────────────────────

async def _try_fast_bulk_order(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-01: 다중/단체 주문 일괄 처리 (단품만, 세트 제외)"""
    lowered = user_message.lower()

    if "세트" in lowered:
        return None
    if not any(kw in lowered for kw in _BULK_ORDER_INTENT_KEYWORDS):
        return None

    found_menus = _find_menus_in_text(user_message)
    if not found_menus:
        return None

    items = [
        {"menu": m, "quantity": _extract_quantity_near_menu(lowered, m["name"])}
        for m in found_menus
    ]

    total_qty = sum(i["quantity"] for i in items)
    # 단품 1개 qty=1은 원칙적으로 Gemini에게 넘김 (세트 여부 확인 필요)
    # 단, 모든 메뉴가 setPrice=None(사이드·음료·디저트)이면 세트 선택 불필요 → Fast Path 허용
    all_no_set = all(i["menu"].get("setPrice") is None for i in items)
    if total_qty < 2 and len(items) < 2 and not all_no_set:
        return None

    valid = [i for i in items if not i["menu"].get("soldOut")]
    if not valid:
        return None

    added_labels = []
    for item in valid:
        result = await execute_tool("add_to_cart", {
            "session_id": session_id,
            "menuId": item["menu"]["menuId"],
            "quantity": item["quantity"],
            "isSet": False,
        })
        if not (isinstance(result, dict) and result.get("error")):
            added_labels.append(f"{item['menu']['name']} {item['quantity']}개")

    if not added_labels:
        return None

    cart_data = build_cart_response(session_id)
    response = {
        "reply": f"{', '.join(added_labels)}을(를) 장바구니에 담았어요.",
        "components": [cart_data],
    }
    _commit_fast_result(session_id, response, req_t0, "fast_bulk_order")
    return response


async def _try_fast_order_modify(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-03: 단순 장바구니 수정 — 삭제 또는 수량 변경"""
    lowered = user_message.lower()

    is_delete = any(kw in lowered for kw in _DELETE_KEYWORDS)
    is_qty_change = any(kw in lowered for kw in _QTY_CHANGE_KEYWORDS)
    if not is_delete and not is_qty_change:
        return None

    if session_id not in carts or not carts[session_id]:
        return None

    cart_data = build_cart_response(session_id)
    items = cart_data.get("items", [])
    if not items:
        return None

    # 메뉴명으로 대상 항목 찾기
    target_item = None
    found_menus = _find_menus_in_text(user_message)
    if found_menus:
        target_ids = {m["menuId"] for m in found_menus}
        for item in items:
            if item.get("menuId") in target_ids:
                target_item = item
                break

    # 서수로 찾기 ("첫 번째", "두 번째" 등)
    if target_item is None:
        for word, idx in _ORDINAL_MAP.items():
            if word in lowered and idx < len(items):
                target_item = items[idx]
                break

    if target_item is None:
        return None

    cart_item_id = target_item["cartItemId"]

    if is_delete:
        result = await execute_tool("delete_cart_item", {
            "session_id": session_id,
            "cartItemId": cart_item_id,
        })
        if isinstance(result, dict) and result.get("error"):
            return None
        updated = build_cart_response(session_id)
        response = {
            "reply": f"{target_item['name']}을(를) 장바구니에서 삭제했어요.",
            "components": [updated],
        }
        _commit_fast_result(session_id, response, req_t0, "fast_modify_delete")
        return response

    # 수량 변경
    qty = _extract_quantity_from_any(lowered)
    if qty < 1:
        return None
    result = await execute_tool("update_cart_item", {
        "session_id": session_id,
        "cartItemId": cart_item_id,
        "quantity": qty,
    })
    if isinstance(result, dict) and result.get("error"):
        return None
    updated = build_cart_response(session_id)
    response = {
        "reply": f"{target_item['name']} 수량을 {qty}개로 변경했어요.",
        "components": [updated],
    }
    _commit_fast_result(session_id, response, req_t0, "fast_modify_qty")
    return response


async def _try_fast_multilingual_order(session_id: str, user_message: str, req_t0: float) -> dict | None:
    """S-08: 영어 단순 주문 fast-path — 매핑 테이블로 메뉴명 인식"""
    if not _is_english_message(user_message):
        return None

    lowered = user_message.lower()

    # 세트/콤보는 옵션 선택이 필요하므로 Gemini에게
    if "set" in lowered or "combo" in lowered:
        return None

    # 주문 의도 확인 (숫자/수량으로 시작하는 경우도 주문으로 처리)
    has_intent = any(kw in lowered for kw in _EN_ORDER_INTENT)
    has_intent = has_intent or bool(re.match(r"^\s*(\d+|two|three|four|five|one|a|an)\s+", lowered))
    if not has_intent:
        return None

    items = _find_en_menu_items(user_message)
    if not items:
        return None

    valid = [i for i in items if not i["menu"].get("soldOut")]
    if not valid:
        return None

    added_labels = []
    for item in valid:
        result = await execute_tool("add_to_cart", {
            "session_id": session_id,
            "menuId": item["menu"]["menuId"],
            "quantity": item["quantity"],
            "isSet": False,
        })
        if not (isinstance(result, dict) and result.get("error")):
            qty_str = f" x{item['quantity']}" if item["quantity"] > 1 else ""
            added_labels.append(f"{item['menu']['name']}{qty_str}")

    if not added_labels:
        return None

    cart_data = build_cart_response(session_id)
    response = {
        "reply": f"Added {', '.join(added_labels)} to your cart!",
        "components": [cart_data],
    }
    _commit_fast_result(session_id, response, req_t0, "fast_multilingual")
    return response


# ── process_message ──────────────────────────────────────────────────────────

async def process_message(session_id: str, user_message: str) -> dict:
    req_t0 = time.perf_counter()

    # Tier 1: 장바구니/주문/결제 등 고정 요청
    fast_result = await _try_fast_path(session_id, user_message, req_t0)
    if fast_result is not None:
        return fast_result

    append_user(session_id, [types.Part.from_text(text=user_message)])

    # Tier 0: in-memory 완결 처리 (budget 먼저 — "3만원으로 4명" 같은 메시지가 menu에 오인 방지)
    for fn in (
        lambda: _try_fast_budget_response(session_id, user_message, req_t0),
        lambda: _try_fast_allergy_response(session_id, user_message, req_t0),
        lambda: _try_fast_comparison_response(session_id, user_message, req_t0),
        lambda: _try_fast_menu_response(session_id, user_message, req_t0),
        lambda: _try_fast_custom_builder(session_id, user_message, req_t0),
    ):
        r = fn()
        if r is not None:
            return r

    # Tier 1b: 단순 주문/수정/다국어 (HTTP 필요, Gemini 0회)
    r = await _try_fast_bulk_order(session_id, user_message, req_t0)
    if r is not None:
        return r

    r = await _try_fast_order_modify(session_id, user_message, req_t0)
    if r is not None:
        return r

    r = await _try_fast_multilingual_order(session_id, user_message, req_t0)
    if r is not None:
        return r

    # Tier 2: Gemini
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
            logger.warning("[%s] round=%d gemini_ms=%.1f", session_id, round_num, (t1 - t0) * 1000)
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                logger.warning("[%s] Gemini API 쿼터 초과.", session_id)
                logger.warning(
                    "[%s] done total_ms=%.1f rounds=%d status=quota_exceeded",
                    session_id, (time.perf_counter() - req_t0) * 1000, round_num + 1,
                )
                return {"reply": "잠시 요청이 많아 처리가 지연되고 있습니다. 10초 후에 다시 시도해주세요.", "components": []}
            elif "503" in error_str or "UNAVAILABLE" in error_str:
                logger.warning("[%s] Gemini API 서버 과부하.", session_id)
                logger.warning(
                    "[%s] done total_ms=%.1f rounds=%d status=unavailable",
                    session_id, (time.perf_counter() - req_t0) * 1000, round_num + 1,
                )
                return {"reply": "AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.", "components": []}
            else:
                logger.error("[%s] Gemini API 오류: %s", session_id, e)
                logger.warning(
                    "[%s] done total_ms=%.1f rounds=%d status=gemini_error",
                    session_id, (time.perf_counter() - req_t0) * 1000, round_num + 1,
                )
                return {"reply": "AI 응답 중 오류가 발생했습니다. 다시 시도해주세요.", "components": []}

        model_content = response.candidates[0].content
        logger.warning("[%s] finish_reason=%s", session_id, response.candidates[0].finish_reason)
        logger.warning("[%s] 응답길이=%d | 전문: %s", session_id, len(str(model_content)), str(model_content)[:1000])

        if not model_content or not model_content.parts:
            logger.warning("[%s] Gemini returned empty parts", session_id)
            logger.warning(
                "[%s] done total_ms=%.1f rounds=%d status=empty_parts",
                session_id, (time.perf_counter() - req_t0) * 1000, round_num + 1,
            )
            return {"reply": "죄송합니다. 응답을 생성하지 못했습니다. 다시 말씀해주세요.", "components": []}

        append_model(session_id, model_content)
        tool_call_parts = [p for p in model_content.parts if p.function_call]

        if not tool_call_parts:
            final_text = "".join(p.text for p in model_content.parts if hasattr(p, "text") and p.text)
            logger.debug("[%s] 최종 응답 수신 len=%d", session_id, len(final_text))
            final_text = _fix_json_text(final_text)
            result = parse_and_validate(final_text)
            _post_process(session_id, result)
            logger.warning(
                "[%s] done total_ms=%.1f rounds=%d status=ok",
                session_id, (time.perf_counter() - req_t0) * 1000, round_num + 1,
            )
            return result

        tool_result_parts = []
        for part in tool_call_parts:
            fc = part.function_call
            tool_args = dict(fc.args) if fc.args else {}
            tool_args["session_id"] = session_id

            logger.info("[%s] Tool 실행: %s(%s)", session_id, fc.name, tool_args)
            t0 = time.perf_counter()
            tool_result = await execute_tool(fc.name, tool_args)
            t1 = time.perf_counter()
            logger.warning(
                "[%s] round=%d tool=%s tool_ms=%.1f",
                session_id, round_num, fc.name, (t1 - t0) * 1000,
            )
            logger.debug("[%s] Tool 결과: %s", session_id, str(tool_result)[:300])
            tool_result_parts.append(
                types.Part.from_function_response(name=fc.name, response={"result": tool_result})
            )

        append_user(session_id, tool_result_parts)

    logger.error("[%s] Tool 루프 최대 반복(%d) 초과", session_id, MAX_TOOL_ROUNDS)
    logger.warning(
        "[%s] done total_ms=%.1f rounds=%d status=max_tool_rounds_exceeded",
        session_id, (time.perf_counter() - req_t0) * 1000, MAX_TOOL_ROUNDS,
    )
    return {
        "reply": "죄송합니다, 처리 중 문제가 발생했습니다. 다시 말씀해 주세요.",
        "components": [],
        "_error": "max_tool_rounds_exceeded",
    }


# ── Tier 1: 고정 요청 처리 (in-memory 우선, HTTP 최소화) ────────────────────

async def _try_fast_path(session_id: str, user_message: str, req_t0: float) -> dict | None:
    msg = _normalize(user_message)

    if _looks_complex(msg):
        return None

    has_coupon = _has_any(msg, ["쿠폰", "할인쿠폰"])
    has_promo = _has_any(msg, ["프로모션", "이벤트", "행사", "할인중", "할인 중", "할인 메뉴", "지금 할인"])

    # S-09 쿠폰+프로모션 통합 (in-memory)
    if has_coupon and has_promo:
        result = {
            "reply": "진행 중인 프로모션과 사용 가능한 쿠폰을 보여드릴게요.",
            "components": [
                {"type": "PromotionBanner", "promotions": _build_promotions_fast()},
                _build_coupons_fast(session_id),
            ],
            "_fastPath": "coupons_promotions",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_coupons_promotions",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    # 쿠폰 단독 (in-memory)
    if has_coupon:
        result = {
            "reply": "사용 가능한 쿠폰을 보여드릴게요.",
            "components": [_build_coupons_fast(session_id)],
            "_fastPath": "coupons",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_coupons",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    # 프로모션 단독 (in-memory)
    if has_promo:
        result = {
            "reply": "현재 진행 중인 프로모션을 보여드릴게요.",
            "components": [{"type": "PromotionBanner", "promotions": _build_promotions_fast()}],
            "_fastPath": "promotions",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_promotions",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    # 장바구니 조회
    if _has_any(msg, ["장바구니", "담은거", "담은 거", "카트", "주문 확인", "담긴거", "담긴 거"]):
        cart = await execute_tool("get_cart", {"session_id": session_id})
        result = {
            "reply": "현재 장바구니를 보여드릴게요.",
            "components": [_ensure_component(cart, "Cart")],
            "_fastPath": "cart",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_cart",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    # 주문 내역 조회
    if _has_any(msg, ["주문내역", "주문 내역", "이전 주문", "지난 주문", "전에 시킨", "전에 주문"]):
        orders = await execute_tool("get_orders", {"session_id": session_id})
        result = {
            "reply": "이전 주문 내역을 보여드릴게요.",
            "components": [_ensure_component(orders, "OrderHistory")],
            "_fastPath": "order_history",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_order_history",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    # 이전 주문 재주문
    if _has_any(msg, ["지난번", "저번", "이전"]) and _has_any(msg, ["그대로", "다시", "또", "재주문"]):
        orders = await execute_tool("get_orders", {"session_id": session_id})
        order_list = orders.get("orders", []) if isinstance(orders, dict) else []

        if not order_list:
            result = {
                "reply": "이전 주문 내역이 없어요. 메뉴를 새로 선택해주세요.",
                "components": [{"type": "OrderHistory", "orders": []}],
                "_fastPath": "reorder_empty",
            }
            logger.warning(
                "[%s] done total_ms=%.1f rounds=0 status=fast_path_reorder_empty",
                session_id, (time.perf_counter() - req_t0) * 1000,
            )
            return result

        latest_order = order_list[-1]
        cart = await execute_tool("reorder", {"session_id": session_id, "order_id": latest_order.get("orderId")})
        result = {
            "reply": "지난 주문을 다시 장바구니에 담았습니다.",
            "components": [_ensure_component(cart, "Cart")],
            "_fastPath": "reorder",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_reorder",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    # 결제/주문 확정
    if _has_any(msg, ["결제", "주문할게", "주문 할게", "주문확정", "주문 확정", "이대로 주문", "이대로 결제"]):
        cart = await execute_tool("get_cart", {"session_id": session_id})

        if not isinstance(cart, dict) or not cart.get("items"):
            result = {
                "reply": "장바구니가 비어 있어요. 먼저 메뉴를 담아주세요.",
                "components": [{"type": "Cart", "items": [], "totalPrice": 0}],
                "_fastPath": "checkout_empty",
            }
            logger.warning(
                "[%s] done total_ms=%.1f rounds=0 status=fast_path_checkout_empty",
                session_id, (time.perf_counter() - req_t0) * 1000,
            )
            return result

        order_type = "takeOut" if _has_any(msg, ["포장", "테이크아웃", "가져갈"]) else "dineIn"
        order = await execute_tool("create_order", {"session_id": session_id, "orderType": order_type})

        if isinstance(order, dict) and order.get("type") == "OrderComplete":
            clear_session(session_id)

        result = {
            "reply": "주문이 완료되었습니다.",
            "components": [_ensure_component(order, "OrderComplete")],
            "_fastPath": "checkout",
        }
        logger.warning(
            "[%s] done total_ms=%.1f rounds=0 status=fast_path_checkout",
            session_id, (time.perf_counter() - req_t0) * 1000,
        )
        return result

    return None


# ── 공용 헬퍼 ────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _has_any(text: str, keywords: list[str]) -> bool:
    return any(kw.lower() in text for kw in keywords)


def _looks_complex(text: str) -> bool:
    complex_keywords = [
        "추천", "비교", "칼로리", "알레르기", "들어가지 않은", "안 들어간", "없는", "빼고", "제외",
        "바꿔", "변경", "추가", "담아", "주세요", "세트", "버거", "사이드", "음료", "콜라", "사이다",
        "가격", "얼마", "가능", "조합", "예산",
    ]
    simple_patterns = [
        "쿠폰 보여", "쿠폰 뭐", "쿠폰 조회", "프로모션 보여", "이벤트 보여",
        "할인 중", "장바구니 보여", "장바구니 확인", "주문 내역", "이전 주문",
    ]
    if any(p in text for p in simple_patterns):
        return False
    return any(kw in text for kw in complex_keywords)


def _ensure_component(data, component_type: str) -> dict:
    if isinstance(data, dict):
        if data.get("type"):
            return data
        return {"type": component_type, **data}
    if component_type == "PromotionBanner":
        return {"type": "PromotionBanner", "promotions": data if isinstance(data, list) else []}
    if component_type == "CouponSelector":
        return {"type": "CouponSelector", "coupons": data if isinstance(data, list) else []}
    if component_type == "OrderHistory":
        return {"type": "OrderHistory", "orders": data if isinstance(data, list) else []}
    if component_type == "Cart":
        return {"type": "Cart", "items": [], "totalPrice": 0}
    return {"type": component_type, "data": data}


def _fix_json_text(final_text: str) -> str:
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
        logger.warning("JSON 잘림 감지 brace=%d, bracket=%d. 복구 시도.", open_braces, open_brackets)
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
    if "OrderComplete" in {c.get("type") for c in result.get("components", [])}:
        clear_session(session_id)
