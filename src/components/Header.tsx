"use client";

import Link from "next/link";
import { useUser } from "@/components/UserContext";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🎪</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#29CCB1] to-[#20B89E] bg-clip-text text-transparent">
            ミラティブフリマ
          </h1>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{user.name}</span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
