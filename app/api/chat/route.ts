import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { message, uid, history } = await req.json();

  try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: message,
        uid: uid || null,
        history: history || [],  // Gửi lịch sử chat đến Python backend
      })
    });
    
    if (!response.ok) {
        throw new Error(`Python Backend Error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json({ reply: data.answer, type: data.type });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Chatbot NPT (Python Backend) đang gặp lỗi kỹ thuật. Vui lòng kiểm tra Terminal Python nhé! 😊" });
  }
}