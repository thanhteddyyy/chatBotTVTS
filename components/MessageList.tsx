"use client";
import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

interface Message {
  id?: string;
  sender: "user" | "bot";
  text: string;
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // auto scroll xuống cuối
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-600">
      {messages.map((m) => (
        <MessageItem key={m.id} message={m} />
      ))}
    </div>
  );
}