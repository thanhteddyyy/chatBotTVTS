// app/chat/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import ChatBox from "@/components/ChatBox"; // Import ChatBox bạn đã sửa
import Image from "next/image";
export default function ChatPage() {
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex h-screen `bg-gradient-to-br` from-gray-900 via-slate-900 to-black text-white">
      
      
      {/* Sidebar - Cố định bên trái */}
      <div className="w-64 bg-[#1e1f20] border-r border-white/5 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-lg tracking-tight">ChatBotNPT</span>
          </div>
          
          <button className="w-full text-left p-3 hover:bg-white/5 rounded-lg text-sm bg-white/10 font-medium transition">
            + Cuộc trò chuyện mới
          </button>
        </div>

        <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
          <button 
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-sm transition"
          >
            <span>⚙️</span> Chỉnh sửa hồ sơ
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-400 rounded-lg text-sm transition"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Area - Chứa ChatBox */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Glow effect cho nền thêm xịn */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] pointer-events-none"></div>
        
        <header className="p-4 flex justify-center items-center border-b border-white/5">
           <span className="text-gray-400 text-sm">ChatBot tư vấn cá nhân hóa 💪</span>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
           {/* ChatBox giờ đây sẽ chiếm trọn không gian */}
           <ChatBox />
        </main>
      </div>
    </div>
  );
}