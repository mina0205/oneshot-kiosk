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

// 에이전트 채팅 API 
export async function sendChat(sessionId: string, message: string) {
  const res = await fetch(`${API_BASE_URL}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),  // sessionId → session_id
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "에이전트 응답 실패" }));
    throw new Error(error.detail || "에이전트 응답 실패");
  }
  return res.json();
}
