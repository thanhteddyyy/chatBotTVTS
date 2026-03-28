// app/page.tsx
"use client";
import Image from "next/image";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginButton from "@/components/LoginButton";
import { checkOnboardingDone } from "@/lib/firestore-helpers";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const teamMembers = [
    {
      id: 1,
      name: "Hoàng Phạm Tiến Thành",
      role: "Frontend Developer 1",
      avatar: "/team/thanh.jpg",
      info: [
        "UX Design",
        "UI Design",
        "Frontend Core",
      ],
    },
    {
      id: 2,
      name: "Trần Duy Nhân",
      role: "Backend Developer",
      avatar: "/team/duynhan.jpg",
      info: [
        "Server Infrastructure",
        "Database Management",
        "API Service",
      ],
    },
    {
      id: 3,
      name: "Đào Huy Phong",
      role: "Frontend Developer 2",
      avatar: "/team/huyphong.jpg",
      info: [
        "API Integration",
        "State Management",
        "Client-side Logic",
      ],
    },
    {
      id: 4,
      name: "Châu Mạnh Phát",
      role: "Data Analyst",
      avatar: "",
      info: [
        "Prompt Design",
        "Response Tuning",
        "Scenario Testing",
      ],
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* ===== HEADER: Logo trái + Login phải ===== */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/5">
        {/* Logo + ChatBot NPT */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo Bách Khoa"
            width={48}
            height={48}
            className="rounded-lg bg-white shadow-md shadow-blue-500/20"
          />
          <div className="h-8 w-[1.5px] bg-white/20"></div>
          <span className="text-white font-bold text-xl tracking-tight">
            ChatBot <span className="text-blue-400">NPT</span>
          </span>
        </div>

        {/* Nút Login góc phải */}
        <LoginButton />
      </header>

      {/* ===== HERO: Giới thiệu + Hình chatbot ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Nội dung giới thiệu bên trái */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight title-glow">
              <span className="text-white">ChatBot </span>
              <span className="text-blue-400">NPT</span>
            </h1>
            <div className="space-y-4 text-gray-300 leading-relaxed text-base md:text-lg">
              <p>
                <strong className="text-white">ChatBot NPT</strong> là trợ lý tư
                vấn tuyển sinh trực tuyến cá nhân hóa được phát triển bởi nhóm sinh viên thuộc khoa
                Khoa học và Kỹ thuật Máy tính của Trường Đại học Bách khoa – ĐHQG-HCM.
              </p>
              <p>
                Trong bối cảnh thông tin tuyển sinh ngày càng phức tạp, thí sinh
                và phụ huynh gặp nhiều khó khăn khi tra cứu. Chatbot NPT ra đời
                nhằm giải quyết vấn đề đó — cung cấp thông tin nhanh chóng, chính
                xác về{" "}
                <span className="text-blue-400 font-medium">ngành học</span>,{" "}
                <span className="text-blue-400 font-medium">
                  phương thức tuyển sinh
                </span>
                ,{" "}
                <span className="text-blue-400 font-medium">điểm chuẩn</span> và{" "}
                <span className="text-blue-400 font-medium">
                  cơ hội nghề nghiệp
                </span>
                .
              </p>
              <p>
                Được xây dựng trên nền tảng AI hiện đại với <strong>Google Gemini</strong>, ChatBot
                có khả năng hiểu ngữ cảnh và trả lời tự nhiên như một tư vấn viên thực thụ.
              </p>
            </div>
          </div>

          {/* Hình chatbot bên phải */}
          <div className="flex-shrink-0 relative">
            <div className="w-64 h-64 md:w-80 md:h-80 relative floating">
              <Image
                src="/chatbot-mascot.png"
                alt="ChatBot NPT Mascot"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(19,127,236,0.3)]"
              />
            </div>
            {/* Vòng sáng trang trí */}
            <div className="absolute -inset-8 rounded-full bg-blue-500/5 blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* ===== NÚT TIẾP TỤC ===== */}
      <section className="max-w-md mx-auto px-6 pb-12">
        {user ? (
          <button
            onClick={async () => {
              const done = await checkOnboardingDone(user.uid);
              router.push(done ? "/chat" : "/onboarding");
            }}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-emerald-600/20 text-lg cursor-pointer"
          >
            Tiếp tục 🚀
          </button>
        ) : (
          <div className="text-center bg-white/5 p-5 rounded-xl border border-white/10 w-full animate-pulse">
            <p className="text-gray-300 text-sm">
              👆 Vui lòng bấm vào{" "}
              <strong className="text-blue-400">Avatar</strong> ở góc trên bên
              phải để bắt đầu Đăng nhập!
            </p>
          </div>
        )}
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      </div>

      {/* ===== TEAM MEMBERS ===== */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          <span className="text-white">Đội ngũ </span>
          <span className="text-blue-400">phát triển</span>
        </h2>
        <p className="text-gray-400 text-center mb-12 text-sm">
          Nhóm sinh viên đứng sau dự án ChatBot NPT
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group flex items-start gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/20 transition-all duration-300"
            >
              {/* Avatar tròn */}
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-2 border-white/10 group-hover:border-blue-400/50 transition-all duration-300 overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/10">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-blue-400/60">
                    {member.name.charAt(member.name.lastIndexOf(" ") + 1)}
                  </span>
                )}
              </div>

              {/* Thông tin bên phải */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">
                  {member.name}
                </h3>
                <p className="text-blue-400 text-xs font-semibold mb-3 tracking-wide uppercase">
                  {member.role}
                </p>
                <ul className="space-y-1.5">
                  {member.info.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-400 text-sm"
                    >
                      <span className="text-blue-500 mt-0.5 text-xs">●</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="text-center py-8 border-t border-white/5">
        <p className="text-gray-500 text-xs">
          © 2026 ChatBot NPT — Trường Đại học Bách khoa - ĐHQG-HCM
        </p>
      </footer>
    </div>
  );
}