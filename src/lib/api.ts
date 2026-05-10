const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 메뉴 API
export async function fetchMenus() {
  const res = await fetch(`${API_BASE_URL}/menus`);
  if (!res.ok) throw new Error("메뉴 목록을 불러올 수 없습니다");
  return res.json();
}

export async function fetchMenuById(menuId: string) {
  const res = await fetch(`${API_BASE_URL}/menus/${menuId}`);
  if (!res.ok) throw new Error("메뉴를 찾을 수 없습니다");
  return res.json();
}

export async function searchMenus(maxCalories: number) {
  const res = await fetch(`${API_BASE_URL}/menus/search?maxCalories=${maxCalories}`);
  if (!res.ok) throw new Error("메뉴 검색에 실패했습니다");
  return res.json();
}

// 에이전트 응답 타입
interface AgentResponse {
  reply: string;
  components: Record<string, unknown>[];
}

// 에이전트 채팅 API — SSE 스트림 엔드포인트 사용
// SSE를 사용하면 서버가 응답을 완성하는 즉시 브라우저에 전달되어
// 긴 처리 중 연결이 끊기는 문제를 방지하고 응답 시작 시간을 단축한다.
export async function sendChat(sessionId: string, message: string): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE_URL}/agent/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "에이전트 응답 실패" }));
    throw new Error((errorData as { detail?: string }).detail ?? "에이전트 응답 실패");
  }

  // SSE 스트림에서 첫 번째 data 이벤트를 읽어 반환
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // "data: {...}\n\n" 패턴 파싱
    const lines = buffer.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr) {
          try {
            return JSON.parse(jsonStr) as AgentResponse;
          } catch {
            // 불완전한 청크 — 계속 읽기
          }
        }
      }
    }
    // 마지막 미완성 라인 보존
    buffer = lines[lines.length - 1];
  }

  throw new Error("SSE 스트림이 데이터 없이 종료되었습니다.");
}