"use client";

import Image from "next/image";
import { useState } from "react";
import { Item } from "@/lib/db";

interface ItemDetailProps {
  item: Item;
  currentSlackId?: string;
  onClose: () => void;
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

function parseImageUrls(imagePath: string | null): string[] {
  if (!imagePath) return [];
  try {
    const parsed = JSON.parse(imagePath);
    if (Array.isArray(parsed)) return parsed;
    return [imagePath];
  } catch {
    return [imagePath];
  }
}

export default function ItemDetail({
  item,
  currentSlackId,
  onClose,
  onWant,
  onComplete,
  onEdit,
}: ItemDetailProps) {
  const [wantSent, setWantSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageUrls = parseImageUrls(item.image_path);
  const isMine = currentSlackId === item.seller_slack_id;
  const deliveryLabel =
    DELIVERY_LABELS[item.delivery_method] ||
    `📝 ${item.delivery_note || item.delivery_method}`;
  const categoryLabel = CATEGORY_LABELS[item.category] || "📦 その他";

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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10 rounded-t-2xl">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex items-center gap-1"
          >
            ← 戻る
          </button>
          {isMine && item.status !== "sold" && (
            <button
              onClick={() => {
                onEdit?.(item);
                onClose();
              }}
              className="text-sm text-[#29CCB1] font-medium hover:text-[#20B89E] transition-colors"
            >
              ✏️ 編集
            </button>
          )}
        </div>

        {/* Images */}
        {imageUrls.length > 0 ? (
          <div className="relative">
            <div className="relative aspect-square bg-gray-50">
              <Image
                src={imageUrls[currentImageIndex]}
                alt={item.title}
                fill
                className="object-contain"
              />
            </div>
            {/* Image pagination dots */}
            {imageUrls.length > 1 && (
              <div className="flex justify-center gap-2 py-2 bg-gray-50">
                {imageUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-[#29CCB1] scale-110"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
            {/* Prev/Next arrows */}
            {imageUrls.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex((i) => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    ‹
                  </button>
                )}
                {currentImageIndex < imageUrls.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex((i) => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    ›
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gray-50 flex flex-col items-center justify-center text-gray-300">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status badge */}
          {item.status === "sold" && (
            <div className="inline-block bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
              お渡し完了 ✅
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-[#1A1A2E]">{item.title}</h2>

          {/* Meta info */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full">
              {categoryLabel}
            </span>
            <span className="bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full">
              {deliveryLabel}
            </span>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2 py-2 border-t border-b border-gray-100">
            {item.seller_image && (
              <Image
                src={item.seller_image}
                alt=""
                width={28}
                height={28}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-gray-600">
              出品者: <span className="font-medium text-[#1A1A2E]">{item.seller_name}</span>
            </span>
          </div>

          {/* Description - full text */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">説明</h3>
            <p className="text-[#1A1A2E] text-sm leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Action */}
          <div className="pt-2">
            {item.status === "sold" ? null : isMine ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-50"
              >
                ✅ お渡し完了にする
              </button>
            ) : (
              <button
                onClick={handleWant}
                disabled={wantSent || loading}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
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
    </div>
  );
}
