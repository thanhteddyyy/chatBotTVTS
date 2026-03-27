"use client";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function MessageItem({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}>
      
      {/* Avatar bot */}
      {!isUser && <div className="text-xl">🤖</div>}

      {/* Bubble */}
      <div
        className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
          isUser
            ? "bg-[#137fec] text-white"
            : "bg-slate-700 text-white"
        }`}
      >
        {message.text}
      </div>

      {/* Avatar user */}
      {isUser && <div className="text-xl">🙂</div>}

    </div>
  );
}