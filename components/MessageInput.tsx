"use client";
import { Send } from "lucide-react";
import { useState } from "react";

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className=" p-4 rounded-[30px] flex gap-2 bg-[#161A2A]/90">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1  outline-none px-3 py-2 text-lg text-white"
        placeholder="Hỏi ChatBotNPT..."
      />
      <button
        onClick={handleSend}
        className="bg-[#4368B2]/90 text-white px-4 rounded-[12px]"
      >
        <Send size = {18}/>
      </button>
    </div>
  );
}