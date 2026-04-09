"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Item } from "@/lib/db";

interface ItemCardProps {
  item: Item;
  currentSlackId?: string;
  onWant: (id: number) => void;
  onComplete: (id: number) => void;
  onEdit?: (item: Item) => void;
}

const DELIVERY_LABELS: Record<string, string> = {
  shipping: "📦 郵送",
  handoff: "🤝 社内手渡し",
};

const CATEGORY_LABELS: Record<string, string> = {
  baby: "👶 ベビー用品",
  toy: "🧸 おもちゃ",
  clothes: "👕 衣類",
  furniture: "🪑 家具・家電",
  book: "📚 本・雑誌",
  other: "📦 その他",
};

export default function ItemCard({
  item,
  currentSlackId,
  onWant,
  onComplete,
  onEdit,
}: ItemCardProps) {
  const [wantSent, setWantSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deliveryLabel =
    DELIVERY_LABELS[item.delivery_method] ||
    `📝 ${item.delivery_note || item.delivery_method}`;

  const categoryLabel = CATEGORY_LABELS[item.category] || "📦 その他";

  const isMine = currentSlackId === item.seller_slack_id;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleWant = async () => {
    setLoading(true);
    await onWant(item.id);
    setWantSent(true);
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!confirm("お渡し完了にしますか？一覧から非表示になります。")) return;
    setLoading(true);
    await onComplete(item.id);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {item.image_path ? (
          <Image
            src={item.image_path}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <svg
              className="w-12 h-12 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">No Image</span>
          </div>
        )}
        {item.status === "sold" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 font-bold px-4 py-2 rounded-full text-sm">
              お渡し完了 ✅
            </span>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
          {categoryLabel}
        </span>
        {/* Menu for own items */}
        {isMine && item.status !== "sold" && (
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white/90 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-10">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(item);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ✏️ 内容を編集
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleComplete();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ✅ お渡し完了
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-[#1A1A2E] text-base truncate">
          {item.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2">
          {item.description.substring(0, 60)}
          {item.description.length > 60 ? "..." : ""}
        </p>

        <div className="flex items-center gap-2 pt-1">
          {item.seller_image && (
            <Image
              src={item.seller_image}
              alt=""
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span className="text-xs text-gray-400">{item.seller_name}</span>
        </div>

        <div className="text-xs text-gray-400">{deliveryLabel}</div>

        {/* Action buttons */}
        <div className="pt-2">
          {item.status === "sold" ? null : isMine ? (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-50"
            >
              ✅ お渡し完了にする
            </button>
          ) : (
            <button
              onClick={handleWant}
              disabled={wantSent || loading}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                wantSent
                  ? "bg-pink-50 text-pink-400 cursor-default"
                  : "bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 shadow-sm hover:shadow-md"
              } disabled:opacity-70`}
            >
              {wantSent ? "💕 Slackに通知済み！" : "💗 欲しい・気になる"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
