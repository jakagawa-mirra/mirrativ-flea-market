"use client";

import { useState } from "react";
import { useUser } from "@/components/UserContext";

export default function LoginButton() {
  const { login } = useUser();
  const [name, setName] = useState("");
  const [slackId, setSlackId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slackId.trim()) {
      setError("両方入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(name.trim(), slackId.trim());
    } catch {
      setError("ログインに失敗しました。Slack メンバーIDが正しいか確認してください");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎪✨</div>
        <h2 className="text-3xl font-bold text-[#1A1A2E]">
          ミラティブフリマ
        </h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          社内のパパ・ママ向けフリマサイト
          <br />
          おうちの不用品をみんなで譲り合おう！
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            表示名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 山田太郎"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#29CCB1] focus:ring-2 focus:ring-[#29CCB1]/20 outline-none transition-all text-[#1A1A2E]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Slack メンバーID
          </label>
          <input
            type="text"
            value={slackId}
            onChange={(e) => setSlackId(e.target.value)}
            placeholder="例: U01ABCD2EFG"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#29CCB1] focus:ring-2 focus:ring-[#29CCB1]/20 outline-none transition-all text-[#1A1A2E]"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-600">IDの確認方法：</span><br />
              Slackで自分のプロフィールを開く →
              <span className="font-medium"> ... </span>（3点リーダー）をクリック →
              <span className="font-medium"> 「Copy member ID」</span>をクリックしてコピペ
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#29CCB1] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#20B89E] transition-all duration-300 text-lg disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <div className="flex gap-6 text-4xl mt-4 opacity-30">
        <span>👶</span>
        <span>🧸</span>
        <span>👕</span>
        <span>📚</span>
        <span>🪑</span>
      </div>
    </div>
  );
}
