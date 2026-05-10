import json
import logging
import re

logger = logging.getLogger(__name__)

VALID_COMPONENT_TYPES = {
    "MenuCard",
    "OptionSelector",
    "Cart",
    "PaymentSummary",
    "AllergyBanner",
    "ComboRecommendation",
    "ComparisonTable",
    "CustomBuilder",
    "PromotionBanner",
    "CouponSelector",
    "OrderHistory",
    "OrderComplete",
}


def _extract_json(text: str) -> str:
    # 코드블록(```json ... ```) 제거
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    
    # Python 불리언 → JSON 불리언 변환
    text = text.replace(": False", ": false").replace(": True", ": true")
    text = text.replace(":False", ":false").replace(":True", ":true")
    text = text.replace(": None", ": null").replace(":None", ":null")
    
    # 첫 번째 { 부터 마지막 } 까지 추출
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start: end + 1]
    return text


def parse_and_validate(raw_text: str) -> dict:
    try:
        json_str = _extract_json(raw_text)
        json_str = (json_str
            .replace(": False", ": false").replace(": True", ": true")
            .replace(":False", ":false").replace(":True", ":true")
            .replace(", False", ", false").replace(", True", ", true")
            .replace("[False", "[false").replace("[True", "[true")
            .replace(": None", ": null").replace(":None", ":null"))
        data = json.loads(json_str)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning("A2UI JSON 파싱 실패: %s | 원문 앞 200자: %s", e, raw_text[:800])

        # ── 잘린 JSON 복구 시도 ──
        try:
            json_str = _extract_json(raw_text)
            json_str = (json_str
                .replace(": False", ": false").replace(": True", ": true")
                .replace(":False", ":false").replace(":True", ":true")
                .replace(", False", ", false").replace(", True", ", true")
                .replace("[False", "[false").replace("[True", "[true")
                .replace(": None", ": null").replace(":None", ":null"))

            # "soldOut": false} 또는 "soldOut": true} 패턴으로 마지막 완전한 객체 찾기
            import re
            # 마지막 완전한 MenuCard 끝 찾기
            matches = list(re.finditer(r'"soldOut"\s*:\s*(false|true)\s*\}', json_str))

            if matches:
                last_match = matches[-1]
                cut = last_match.end()

                # cut 위치 다음에 , 가 있으면 건너뛰기
                truncated = json_str[:cut]

                # components 배열과 최외곽 객체 닫기
                open_brackets = truncated.count("[") - truncated.count("]")
                open_braces = truncated.count("{") - truncated.count("}")
                truncated += "]" * open_brackets + "}" * open_braces

                logger.warning("잘린 JSON 복구 시도 (cut=%d, 닫기: ]=%d }=%d)",
                               cut, open_brackets, open_braces)
                data = json.loads(truncated)
            else:
                raise e

        except (json.JSONDecodeError, ValueError):
            logger.error("JSON 복구 실패. 텍스트만 반환.")
            return {
                "reply": raw_text,
                "components": [],
                "_parse_error": True,
            }

    # 필수 키 보장
    data.setdefault("reply", "")
    data.setdefault("components", [])

    # 유효하지 않은 컴포넌트 type 필터링
    valid, invalid = [], []
    for comp in data["components"]:
        if comp.get("type") in VALID_COMPONENT_TYPES:
            valid.append(comp)
        else:
            invalid.append(comp.get("type"))

    if invalid:
        logger.warning("알 수 없는 컴포넌트 type 제거: %s", invalid)

    data["components"] = valid
    return data