import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function classifyIntent(query: string): Promise<"A" | "B" | "C"> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Phân loại câu hỏi học sinh THPT. Trả lời CHỈ 1 chữ cái A, B hoặc C.

A = Hướng nghiệp, sở thích, gợi ý trường/ngành (thích đồ họa, công nghệ...).
B = Lịch tuyển sinh, deadline, lệ phí, thủ tục.
C = Điểm chuẩn, học phí, so sánh trường.

Câu hỏi: "${query}"

Trả lời CHỈ 1 chữ cái:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().toUpperCase();
  console.log("🔍 INTENT:", text);
  return ["A","B","C"].includes(text) ? (text as "A" | "B" | "C") : "A";
}