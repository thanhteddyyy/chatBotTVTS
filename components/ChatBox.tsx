"use client";
import { useState, useRef, useEffect } from "react";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBoxProps {
  messages: Message[];
  onMessagesUpdate: (msgs: Message[]) => void;
}

export default function ChatBox({ messages: messagesProp, onMessagesUpdate }: ChatBoxProps) {
  // Guard against undefined during SSR/hydration race
  const messages = messagesProp ?? [];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !uid) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    onMessagesUpdate(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const historyToSend = updatedMessages.slice(1).slice(-10);

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

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply || "Xin lỗi, mình chưa hiểu rõ lắm 😅",
      };
      onMessagesUpdate([...updatedMessages, assistantMsg]);
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      const errMsg: Message = {
        role: "assistant",
        content: "Xin lỗi, server đang gặp vấn đề. Bạn thử lại nhé!",
      };
      onMessagesUpdate([...updatedMessages, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white shadow-blue-500/20"
                  : "bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200 shadow-black/20"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="markdown-body">
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => (
                        <strong className="text-blue-400 font-semibold">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold text-white mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold text-white mb-2">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-white mb-1">{children}</h3>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm text-emerald-400">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-blue-500 pl-3 my-2 italic text-gray-400">
                          {children}
                        </blockquote>
                      ),
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-2xl text-gray-400 animate-pulse">
              💭 Đang suy nghĩ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Hỏi mình bất cứ điều gì về trường đại học nhé..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/20 font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}