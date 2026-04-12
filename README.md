### 개요
S-01(단체주문)부터 S-05(예산 추천)까지 5개 시나리오를 지원하는 AI 에이전트 구현.
`google-genai` SDK를 사용해 Gemini 2.0 Flash 모델과 연동하며, 자연어 입력을 A2UI JSON 응답으로 변환하는 전체 파이프라인 초안을 6개 파일로 분리하여 구성.

파일 구성

- `prompts.py` / `tools.py` / `tool_executor.py` / `session.py` / `parser.py` / `agent.py`

---

### Feature

- **AI 에이전트 파이프라인 구현** (`agent.py`)
    - `process_message(session_id, user_message)` 함수가 단일 진입점이며 Tool 루프 전체를 담당 →  FastAPI 라우터와 연동하여 호출
    - Gemini Tool call → Tool 실행 → 결과를 히스토리에 추가 → 다시 Gemini 호출
    - 재호출 루프를 최대 10회 반복하는 자동 처리 구현하여 무한루프 방지
    - `session_id` 자동 주입으로 Gemini가 session_id를 누락하더라도 장바구니 API 정상 호출 보장
    - `OrderComplete` 컴포넌트가 포함된 경우 세션을 초기화하는 응답 후처리 추가
- **시스템 프롬프트 설계** (`prompts.py`)
    - 역할 정의, Tool 호출 판단 기준, A2UI JSON 출력 형식, 컴포넌트 props 스키마, 시나리오별(S-01~S-05) 컴포넌트 조합 가이드 포함
    - 지원 컴포넌트: `MenuCard`, `OptionSelector`, `Cart`, `PaymentSummary`, `AllergyBanner`, `ComboRecommendation`
- **Tool 선언 구현** (`tools.py`)
    - Gemini Function Calling 형식으로 7개 Tool 선언
    - 각 Tool의 `description`에 호출 판단 기준을 명시하여 Gemini가 스스로 Tool을 선택하도록 설계
    - 지원 Tool: `get_all_menus`, `search_menus_by_condition`, `get_set_options`, `get_cart`, `add_to_cart`, `update_cart_item`, `delete_cart_item`
    - Tool 함수 이름이 확정되면 그에 맞게 수정 예정
- **BE API 연동 구현** (`tool_executor.py`)
    - Gemini가 지시한 Tool 이름을 실제 BE REST API HTTP 호출로 매핑
    - `httpx` 비동기 클라이언트 사용, 타임아웃 10초 설정
    - HTTPStatusError 및 일반 예외 개별 처리, 에러 발생 시 Gemini에게 에러 내용 반환
- **세션/히스토리 관리 구현** (`session.py`)
    - Gemini 상태없음(stateless) 특성 보완을 위해 인메모리 딕셔너리로 세션별 대화 히스토리 관리
    - `append_user` 는 사용자 메시지(또는 Tool 결과)/ `append_model` 는 Gemini 모델 응답 → 역할 분리로 히스토리 오염 방지
- **A2UI JSON 파싱·검증 구현** (`parser.py`)
    - 응답에서 코드블록 제거 및 JSON 추출 처리
    - 유효하지 않은 컴포넌트 `type`은 해당 컴포넌트만 제거하고 나머지 응답은 유지
    - 파싱 실패 시 서버 오류 없이 fallback 응답 반환

---

### Chore

- 의존성 패키지: `google-genai`, `httpx`, `fastapi`
    - 의존성 설치:  `pip install google-genai httpx fastapi`
- 환경 변수: `GOOGLE_API_KEY`
- 사용 모델: `gemini-2.0-flash`