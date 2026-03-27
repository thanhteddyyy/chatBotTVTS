// components/LoginButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/utils/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { initUserDocument, checkOnboardingDone, updateLastActive } from "@/lib/firestore-helpers";

export default function LoginButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setShowMenu(false);
        // Cập nhật lastActiveAt mỗi lần mở app
        try { await updateLastActive(currentUser.uid); } catch {}
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;

      // Khởi tạo document nếu lần đầu
      await initUserDocument({
        uid: u.uid,
        displayName: u.displayName,
        photoURL: u.photoURL,
      });

      // Kiểm tra onboarding
      const done = await checkOnboardingDone(u.uid);
      if (done) {
        router.push("/chat");
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      {/* Avatar */}
      <div
        className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
        onClick={() => setShowMenu(!showMenu)}
      >
        {user ? (
          <img
            src={user.photoURL || "https://ui-avatars.com/api/?name=User"}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg shadow-blue-400/20"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 transition flex items-center justify-center rounded-full border border-gray-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute right-0 mt-3 z-50 shadow-2xl min-w-[240px] bg-[#1e1f20] border border-white/10 rounded-xl p-4">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="text-gray-300 text-sm text-center mb-1">
                Xin chào, <br />
                <span className="font-bold text-blue-400 truncate block mt-1">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={() => { router.push("/profile"); setShowMenu(false); }}
                className="w-full text-center px-4 py-2.5 bg-blue-500/10 text-blue-400 font-medium hover:bg-blue-500/20 transition-colors rounded-lg text-sm"
              >
                📝 Hồ sơ của tôi
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-center px-4 py-3 bg-red-500/10 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-colors rounded-lg text-sm"
              >
                ĐĂNG XUẤT
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-center pb-2 border-b border-white/10">
                Bắt đầu trải nghiệm
              </div>

              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 font-bold hover:bg-gray-200 transition-colors rounded-lg text-sm shadow-lg shadow-white/10"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                GOOGLE LOGIN
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}