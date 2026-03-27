"use client";
import { useState, useRef, useEffect } from "react";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Chào bạn! Mình là **ChatBotNPT** 👋 Hôm nay bạn muốn tư vấn gì về hướng nghiệp hoặc tuyển sinh?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy uid từ Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // Auto scroll xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !uid) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Gửi lịch sử chat (không gồm tin nhắn welcome) để backend có context
      const historyToSend = updatedMessages
        .slice(1) // Bỏ tin nhắn chào mừng đầu tiên
        .slice(-10); // Giữ 10 tin nhắn gần nhất (5 lượt hội thoại)

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          uid,
          history: historyToSend,
        }),
      });

      const data = await res.json();
      console.log("📨 API trả về:", data);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Xin lỗi, mình chưa hiểu rõ lắm 😅" }]);
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi, server đang gặp vấn đề. Bạn thử lại nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0f1117]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-[#1e1f20] text-gray-200"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="markdown-body">
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => <strong className="text-blue-400 font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">{children}</a>,
                      code: ({ children }) => <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm text-emerald-400">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-500 pl-3 my-2 italic text-gray-400">{children}</blockquote>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1e1f20] px-5 py-3 rounded-2xl text-gray-400 animate-pulse">
              💭 Đang suy nghĩ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#0f1117]">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Hỏi mình bất cứ điều gì về trường đại học nhé..."
            className="flex-1 bg-[#1e1f20] border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 rounded-2xl transition"
          >
            {isLoading ? "..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}