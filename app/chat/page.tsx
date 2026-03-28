// app/chat/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import ChatBox from "@/components/ChatBox";
import type { Message } from "@/components/ChatBox";
import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "chatbot_npt_conversations";
const ACTIVE_KEY = "chatbot_npt_active_id";
const WELCOME: Message = {
  role: "assistant",
  content:
    "Chào bạn! Mình là **ChatBotNPT** 👋 Hôm nay bạn muốn tư vấn gì về hướng nghiệp hoặc tuyển sinh?",
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function newConversation(): Conversation {
  return {
    id: genId(),
    title: "Cuộc trò chuyện mới",
    messages: [WELCOME],
    createdAt: Date.now(),
  };
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function persist(convs: Conversation[], activeId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  localStorage.setItem(ACTIVE_KEY, activeId);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    const loaded = loadConversations();
    const savedActive = localStorage.getItem(ACTIVE_KEY) ?? "";

    if (loaded.length === 0) {
      const fresh = newConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
      persist([fresh], fresh.id);
    } else {
      setConversations(loaded);
      const valid = loaded.find((c) => c.id === savedActive);
      const aid = valid ? savedActive : loaded[loaded.length - 1].id;
      setActiveId(aid);
    }
    setMounted(true);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNewConversation = () => {
    const fresh = newConversation();
    setConversations((prev) => {
      const updated = [...prev, fresh];
      persist(updated, fresh.id);
      return updated;
    });
    setActiveId(fresh.id);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  };

  const handleDeleteRequest = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const deletingId = confirmDeleteId;
    setConfirmDeleteId(null);

    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== deletingId);
      if (updated.length === 0) {
        const fresh = newConversation();
        persist([fresh], fresh.id);
        setActiveId(fresh.id);
        return [fresh];
      }
      const newActive =
        activeId === deletingId ? updated[updated.length - 1].id : activeId;
      persist(updated, newActive);
      setActiveId(newActive);
      return updated;
    });
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  // Called by ChatBox whenever messages change
  const handleMessagesUpdate = (msgs: Message[]) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== activeId) return c;
        // Auto-title from first user message
        const firstUser = msgs.find((m) => m.role === "user");
        const title =
          firstUser && c.title === "Cuộc trò chuyện mới"
            ? firstUser.content.length > 30
              ? firstUser.content.slice(0, 30) + "..."
              : firstUser.content
            : c.title;
        return { ...c, messages: msgs, title };
      });
      persist(updated, activeId);
      return updated;
    });
  };

  const handleLogout = () => {
    signOut(auth);
    router.push("/");
  };

  const activeConversation = conversations.find((c) => c.id === activeId);
  const currentMessages = activeConversation?.messages ?? [WELCOME];

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">

      {/* ── Confirm Delete Modal ───────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">
              Xóa cuộc trò chuyện?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Hành động này sẽ xóa vĩnh viễn cuộc trò chuyện và không thể khôi
              phục.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition text-sm cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition text-sm cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-64 bg-black/30 backdrop-blur-md border-r border-white/5 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-white/5">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-lg tracking-tight">
            ChatBot <span className="text-blue-400">NPT</span>
          </span>
        </div>

        {/* New Conversation Button */}
        <div className="px-3 pt-3 pb-2">
          <button
            id="btn-new-conversation"
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 p-3 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/40 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {conversations.length > 0 && (
            <p className="text-gray-500 text-[11px] px-2 py-2 uppercase tracking-widest font-medium">
              Lịch sử
            </p>
          )}
          {[...conversations].reverse().map((conv) => (
            <div
              key={conv.id}
              id={`conv-${conv.id}`}
              onClick={() => handleSelectConversation(conv.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                conv.id === activeId
                  ? "bg-blue-600/20 border border-blue-500/30 text-white"
                  : "hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent"
              }`}
            >
              {/* Chat icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 flex-shrink-0 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>

              <div className="flex-1 min-w-0">
                <p className="text-sm truncate font-medium leading-tight">
                  {conv.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {formatDate(conv.createdAt)}
                </p>
              </div>

              {/* Delete button */}
              <button
                id={`btn-delete-${conv.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRequest(conv.id);
                }}
                title="Xóa cuộc trò chuyện"
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all duration-150 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="border-t border-white/5 p-3 space-y-1">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <span>⚙️</span> Chỉnh sửa hồ sơ
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl text-sm transition-all cursor-pointer"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 p-4 flex justify-center items-center border-b border-white/5 bg-black/10 backdrop-blur-sm">
          <span className="text-gray-400 text-sm">
            ChatBot tư vấn cá nhân hóa 💪
          </span>
        </header>

        {/* ChatBox */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatBox
            key={activeId}
            messages={currentMessages}
            onMessagesUpdate={handleMessagesUpdate}
          />
        </main>
      </div>
    </div>
  );
}