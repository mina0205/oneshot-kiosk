# OneShot — A2UI 기반 차세대 패스트푸드 키오스크

> 2026 한국정보기술학회 추계 종합학술대회 발표 프로젝트  
> "A2UI 기반 Generative UI를 활용한 차세대 패스트푸드 키오스크 시스템"

## 개요

국내 키오스크 보급 대수는 2023년 기준 53만 대를 넘어섰지만, 65세 이상 고령층의 키오스크 독립 이용 비율은 **17.9%** 에 불과합니다. 기존 키오스크의 복잡한 다단계 메뉴 탐색 구조가 핵심 원인입니다.

**OneShot** 은 Google이 공개한 A2UI(Agent-to-User Interface) 프로토콜을 적용하여, 사용자가 자연어 한 문장으로 주문을 완료할 수 있는 Generative UI 키오스크 웹 애플리케이션입니다. 기존 키오스크에서 12단계 이상 필요하던 단체 주문을 1~2단계로 줄이고, 기존 구조에서 불가능했던 칼로리 필터링·알레르기 제외·예산 조합 추천 등을 자연어만으로 처리합니다.

## 주요 기능

| 시나리오 | 기존 키오스크 | OneShot |
|---------|-------------|---------|
| 단체 주문 | 12단계 이상 | 자연어 1~2단계 |
| 칼로리 필터 추천 | 불가능 | 자연어 조건 입력 |
| 주문 중간 수정 | 삭제 후 재주문 (5~6단계) | 변경 요청 1단계 |
| 알레르기 필터링 | 불가능 | 제한 조건 발화 1단계 |
| 예산 최적 조합 | 불가능 | 예산·인원 발화 1단계 |
| 리오더 | 지원 안 됨 | 리오더 요청 1단계 |
| 메뉴 비교 | 불가능 | 비교 요청 1단계 |
| 프로모션·쿠폰 | 배너 확인 후 수동 탐색 (4~5단계) | 할인 조회 발화 1단계 |

**논문 이후 추가 구현**
- **STT (Speech-to-Text)**: OpenAI Whisper API 연동으로 음성 주문 지원. 인식된 텍스트를 입력창에 먼저 표시한 뒤 사용자가 확인 후 전송
- **Fast Path 최적화**: 쿠폰·프로모션·장바구니·리오더 등 자주 사용되는 시나리오를 규칙 기반으로 즉시 처리하여 LLM 호출 없이 수 ms 내 응답

## 아키텍처

```
사용자 자연어 입력 (텍스트 / 음성)
        │
        ▼
  Frontend (Next.js 16 + TypeScript)
  ├── ChatInput        텍스트 입력 + STT 음성 입력
  ├── A2UIRenderer     선언적 JSON → UI 컴포넌트 렌더링
  └── Zustand          장바구니 · 세션 · UI 상태 관리
        │ POST /agent/chat
        ▼
  Backend — AI Agent Layer (FastAPI + Python)
  ├── agent.py         에이전트 오케스트레이터
  │   ├── Fast Path    규칙 기반 즉시 응답 (LLM 호출 없음, ~1ms)
  │   └── Gemini Loop  복잡한 의도 처리 (최대 10라운드 Tool 루프)
  ├── prompts.py       시스템 프롬프트 · 컴포넌트 스키마
  ├── tools.py         7개 Tool 선언 (Gemini Function Calling)
  ├── tool_executor.py Tool → REST API HTTP 호출
  ├── session.py       멀티턴 대화 히스토리 (인메모리)
  └── parser.py        A2UI JSON 구조 검증 · fallback 처리
        │ HTTP
        ▼
  Backend — REST API Layer (14개 엔드포인트)
  ├── /menus           전체 조회 · 조건 검색 · 단일 상세
  ├── /set_options     사이드 · 음료 · 토핑 옵션
  ├── /cart            추가 · 수정 · 삭제 · 비우기
  ├── /orders          주문 생성 · 이력 · 리오더
  ├── /promotions      프로모션 조회
  └── /coupons         쿠폰 조회
        │
        ▼
  Data Layer (JSON 파일)
```

### A2UI 컴포넌트 카탈로그

에이전트 응답으로 생성된 선언적 JSON을 `A2UIRenderer`가 읽어 아래 12종 컴포넌트 중 적합한 것을 화면에 렌더링합니다.

| 컴포넌트 | 역할 |
|---------|------|
| `MenuCard` | 메뉴 정보 표시 |
| `Cart` | 장바구니 |
| `PaymentSummary` | 결제 요약 |
| `OptionSelector` | 세트 옵션 선택 |
| `ComparisonTable` | 메뉴 비교 |
| `ComboRecommendation` | 예산 기반 조합 추천 |
| `CustomBuilder` | 재료별 커스터마이징 |
| `AllergyBanner` | 알레르기 경고 |
| `PromotionBanner` | 프로모션 안내 |
| `CouponSelector` | 쿠폰 선택 |
| `OrderHistory` | 주문 이력 |
| `OrderComplete` | 주문 완료 |

## 기술 스택

**Frontend**
- Next.js 16.2 / React 19 / TypeScript
- Zustand (상태 관리)
- Tailwind CSS v4 / Framer Motion / Lucide React
- @a2ui-sdk/react

**Backend**
- FastAPI / Python
- Google Gemini 2.5 Flash (`google-genai`) — 자연어 의도 파악 · A2UI JSON 생성
- OpenAI Whisper (`whisper-1`) — STT 음성 인식

## 시작하기

### 사전 요구사항

- Node.js 20+
- Python 3.11+
- Google Gemini API 키
- OpenAI API 키 (STT 사용 시)

### 환경변수 설정

**`backend/.env`**
```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

**`.env.local`** (프로젝트 루트)
```env
OPENAI_API_KEY=your_openai_api_key
```

### 실행

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
npm install
npm run dev
# http://localhost:3000
```

## 팀

경기대학교 캡스톤디자인 프로젝트

김민아 · 김상현 · 권소윤 · 김연호 · 염지은 · 최지우 · 염수민  
지도교수: 이재흥 (AI컴퓨터공학부)

