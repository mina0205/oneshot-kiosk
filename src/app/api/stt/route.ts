// src/app/api/stt/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "오디오 파일 없음" }, { status: 400 });
    }

    const openaiForm = new FormData();
    openaiForm.append("file", audioFile, "audio.webm");
    openaiForm.append("model", "whisper-1");
    openaiForm.append("language", "ko");
    // 키오스크 도메인 프롬프트: 메뉴명·주문 관련 단어를 Whisper가 정확히 인식하도록 힌트 제공
    openaiForm.append(
      "prompt",
      "롯데리아 패스트푸드 키오스크 주문. " +
      "메뉴: 리아 불고기, 데리버거, 한우불고기버거, 핫크리스피치킨버거, 미라클버거, 치킨버거, 클래식치즈버거, 리아 새우, 리아 새우 베이컨, " +
      "후라이드치킨, 양념치킨, 치킨너겟, 포테이토, 치즈스틱, 통오징어링, 코울슬로, " +
      "펩시콜라, 제로슈거콜라, 아이스아메리카노, 초코선데, 딸기선데. " +
      "주문 관련 단어: 세트, 단품, 사이드, 음료, 추천, 담아줘, 주문할게, 결제, 쿠폰, 프로모션, 장바구니, 칼로리, 알레르기."
    );

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiForm,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Whisper API 오류:", err);
      return NextResponse.json({ error: "Whisper API 실패" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("STT 처리 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
