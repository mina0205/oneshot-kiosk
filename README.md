# test

# test

# test
# 🍔 Oneshot Kiosk Agent (LLM 기반 키오스크 시스템)

본 프로젝트는 기존 키오스크의 한계를 개선하기 위해  
**LLM(Gemini) 기반 에이전트 + Generative UI(A2UI)** 구조를 적용한 주문 시스템입니다.

---

## 📌 주요 기능

### 🤖 LLM 기반 에이전트
- Gemini API를 활용한 자연어 이해
- 사용자 발화를 시나리오로 자동 분류
- Tool 기반 기능 실행 후 UI JSON 생성

---

## 🧠 지원 시나리오

| 시나리오 | 설명 |
|--------|------|
| S-06 | 이전 주문 반복 |
| S-07 | 메뉴 비교 분석 |
| S-08 | 다국어 주문 |
| S-09 | 프로모션 및 쿠폰 안내 |
| S-10 | 커스텀 버거 주문 |

---

## 🧩 A2UI (Generative UI)

에이전트는 다음 구조로 응답을 생성합니다:

```json
{
  "reply": "사용자에게 보여줄 텍스트",
  "components": []
}
```

### 주요 컴포넌트
- MenuCard
- Cart
- PaymentSummary
- ComparisonTable
- OrderHistory
- PromotionBanner
- CouponSelector
- CustomBuilder

---

## 🏗️ 프로젝트 구조

```
backend/
 ├── main.py                # FastAPI 서버
 ├── kiosk_agent.py        # 에이전트 로직
 ├── system_prompt_v1.md   # 시스템 프롬프트
 ├── menu_data.json        # 메뉴 데이터
 ├── set_options.json      # 옵션 데이터
```

---

## ⚙️ 실행 방법

### 1. 가상환경 생성 및 실행

```bash
python -m venv .venv
.venv\Scripts\activate
```

---

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

---

### 3. Gemini API 키 설정

PowerShell 기준:

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

---

### 4. 서버 실행

```bash
uvicorn main:app --reload
```

---

### 5. Swagger 접속

```
http://127.0.0.1:8000/docs
```

---

## 🚀 에이전트 API

### POST `/agent/chat`

```json
{
  "session_id": "test-user",
  "message": "지난번에 시킨 거 그대로 다시 주문해줘"
}
```

---

## 🛠️ 기술 스택

- Python
- FastAPI
- Gemini API (Google Generative AI)
- JSON 기반 UI 구조 (A2UI)

---

## 📄 시스템 프롬프트

- `system_prompt_v1.md` 참고
- 역할 정의 / 시나리오 / 출력 형식 포함

---

## ⚠️ 주의 사항

- `node_modules`, `.venv`, `.env` 등은 커밋하지 않음
- API Key는 절대 코드에 직접 작성 금지
- `.gitignore` 반드시 설정

---

## ✨ 핵심 포인트

👉 단순 API 서버가 아닌  
👉 **LLM + Tool + UI 생성까지 연결된 Agent 구조 구현**

---

## 👩‍💻 작성자

- AI / Backend: Soyun

---