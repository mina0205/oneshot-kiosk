// [Cell 1]: src/app/api/chat/route.ts
// 1.5 버전을 인식하지 못하는 환경을 위해, 가장 안정적인 1.0 모델(gemini-pro)로 우회합니다.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { menuData } from '@/data/menuData';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", // 🚀 현재 가장 빠르고 안정적인 모델 이름입니다.
        generationConfig: { responseMimeType: "application/json" } // 최신 모델이므로 다시 JSON 강제 옵션 켜기!
    });

    const menuContext = menuData.map(menu => 
      `- ID: ${menu.menuId}, 이름: ${menu.name}, 특징: ${menu.description}`
    ).join('\n');

    // 🚀 수정 2: JSON 옵션이 빠졌으므로 프롬프트(명령)에서 엄청나게 협박(?)을 해야 합니다.
    const prompt = `
      너는 패스트푸드점 키오스크 AI 에이전트야.
      사용자의 요청을 분석해서, 아래 메뉴판에서 가장 알맞은 메뉴들의 'menuId'를 골라내.

      [메뉴판 데이터]
      ${menuContext}

      [사용자 요청]
      "${message}"

      [출력 규칙 - 매우 중요]
      - 반드시 추천할 메뉴의 menuId만 골라서 아래와 같은 순수 JSON 배열 형식으로만 응답해.
      - 마크다운(예: \`\`\`json) 기호나 다른 인사말은 절대 쓰지 마.
      예시: [{"menuId": "burger-004"}, {"menuId": "burger-001"}]
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // AI가 말을 안 듣고 기호를 넣었을 경우를 대비한 강력한 텍스트 청소기
    const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const aiResponse = JSON.parse(cleanJsonText); 

    const uiMessages = aiResponse.map((item: { menuId: string }, index: number) => {
      const selectedMenu = menuData.find(m => m.menuId === item.menuId);
      return {
        id: `ai-msg-${Date.now()}-${index}`,
        type: 'MENU_CARD',
        props: selectedMenu 
      };
    });

    return NextResponse.json({ uiData: uiMessages });
    
  } catch (error: any) {
    console.error("🔥 백엔드 에러 발생 원인:", error);
    return NextResponse.json({ error: `서버 에러: ${error.message}` }, { status: 500 });
  }
}