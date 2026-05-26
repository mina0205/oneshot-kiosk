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
