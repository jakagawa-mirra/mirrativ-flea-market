"use client";

import { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
import ItemDetail from "./ItemDetail";
import { Item } from "@/lib/db";

interface ItemListProps {
  currentSlackId?: string;
  category: string;
  myItems?: boolean;
  onEdit?: (item: Item) => void;
}

const CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "baby", label: "👶 ベビー" },
  { id: "toy", label: "🧸 おもちゃ" },
  { id: "clothes", label: "👕 衣類" },
  { id: "furniture", label: "🪑 家具" },
  { id: "book", label: "📚 本" },
  { id: "other", label: "📦 その他" },
];

export default function ItemList({
  currentSlackId,
  myItems,
  onEdit,
}: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (myItems) params.set("my", "true");
    else if (selectedCategory !== "all")
      params.set("category", selectedCategory);

    const res = await fetch(`/api/items?${params}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, myItems]);

  const handleWant = async (id: number) => {
    await fetch(`/api/items/${id}/want`, { method: "POST" });
  };

  const handleComplete = async (id: number) => {
    await fetch(`/api/items/${id}`, { method: "PATCH" });
    fetchItems();
  };

  return (
    <div className="space-y-4">
      {/* Item detail modal */}
      {detailItem && (
        <ItemDetail
          item={detailItem}
          currentSlackId={currentSlackId}
          onClose={() => setDetailItem(null)}
          onWant={handleWant}
          onComplete={handleComplete}
          onEdit={onEdit}
        />
      )}
      {/* Category filter (not shown on my items tab) */}
      {!myItems && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#29CCB1] text-white shadow-sm"
                  : "bg-white text-gray-500 hover:bg-emerald-50 border border-emerald-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-3 border-[#29CCB1] border-t-transparent rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p>
            {myItems
              ? "まだ出品していません"
              : "まだ出品がありません"}
          </p>
          <p className="text-sm mt-1">
            {myItems
              ? "「出品・譲りたい」タブから出品してみましょう！"
              : "最初の出品者になりましょう！"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentSlackId={currentSlackId}
              onWant={handleWant}
              onComplete={handleComplete}
              onEdit={onEdit}
              onDetail={setDetailItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
