import { faq } from "@/data/faq";

export function getBotReply(userMessage: string): string {
  const message = userMessage.toLowerCase();

  for (const item of faq) {
    for (const keyword of item.keywords) {
      if (message.includes(keyword)) {
        return item.answer;
      }
    }
  }

  return "🤔 Mình chưa hiểu câu hỏi này.";
}