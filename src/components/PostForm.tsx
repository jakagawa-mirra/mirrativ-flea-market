"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Item } from "@/lib/db";

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

interface PostFormProps {
  onSuccess: () => void;
  editItem?: Item | null;
  onCancelEdit?: () => void;
}

export default function PostForm({ onSuccess, editItem, onCancelEdit }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("handoff");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [category, setCategory] = useState("other");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editItem;

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description);
      setDeliveryMethod(editItem.delivery_method);
      setDeliveryNote(editItem.delivery_note || "");
      setCategory(editItem.category);
      // Parse existing images
      const urls = parseImageUrls(editItem.image_path);
      setExistingImages(urls);
      setImagePreviews(urls);
      setImageFiles([]);
    }
  }, [editItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Generate previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      // Remove existing image
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove new file
      const fileIndex = index - existingImages.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("delivery_method", deliveryMethod);
    formData.append("category", category);
    if (deliveryMethod === "other") {
      formData.append("delivery_note", deliveryNote);
    }
    // Send existing images (for edit mode)
    if (isEditing && existingImages.length > 0) {
      formData.append("existing_images", JSON.stringify(existingImages));
    }
    // Send new image files
    for (const file of imageFiles) {
      formData.append("images", file);
    }

    try {
      const url = isEditing ? `/api/items/${editItem.id}` : "/api/items";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        setSuccess(true);
        setTitle("");
        setDescription("");
        setDeliveryMethod("handoff");
        setDeliveryNote("");
        setCategory("other");
        setImagePreviews([]);
        setImageFiles([]);
        setExistingImages([]);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h3 className="text-xl font-bold text-[#29CCB1]">
          {isEditing ? "更新完了！" : "出品完了！"}
        </h3>
        <p className="text-gray-500 text-sm">
          {isEditing
            ? "内容が更新されました"
            : "Slackの #z_club_papamama に投稿されました"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
            {isEditing ? "✏️ 内容を編集" : "📦 出品する"}
          </h3>
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>

        {/* Image upload - multiple */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            写真（複数可・任意）
          </label>
          <div className="space-y-3">
            {/* Image previews grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-emerald-100">
                    <Image
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-black/70 transition-colors"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#29CCB1] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        メイン
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Add photo button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#29CCB1] hover:bg-emerald-50/50 transition-all"
            >
              <span className="text-2xl mb-1">📷</span>
              <span className="text-sm text-gray-400">
                {imagePreviews.length === 0
                  ? "タップして写真を追加"
                  : "写真を追加"}
              </span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            商品名 <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: ベビーカー（コンビ・2022年購入）"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#29CCB1] focus:ring-2 focus:ring-[#29CCB1]/20 outline-none transition-all text-[#1A1A2E]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            説明 <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="状態や補足など自由にどうぞ"
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#29CCB1] focus:ring-2 focus:ring-[#29CCB1]/20 outline-none transition-all resize-none text-[#1A1A2E]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            カテゴリ
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "baby", label: "👶 ベビー用品" },
              { id: "toy", label: "🧸 おもちゃ" },
              { id: "clothes", label: "👕 衣類" },
              { id: "furniture", label: "🪑 家具・家電" },
              { id: "book", label: "📚 本・雑誌" },
              { id: "other", label: "📦 その他" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  category === cat.id
                    ? "bg-[#29CCB1] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery method */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            受け渡し方法 <span className="text-rose-400">*</span>
          </label>
          <div className="space-y-2">
            {[
              { id: "handoff", label: "🤝 社内手渡し" },
              { id: "shipping", label: "📦 郵送" },
              { id: "other", label: "📝 その他" },
            ].map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === method.id
                    ? "border-[#29CCB1] bg-emerald-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={method.id}
                  checked={deliveryMethod === method.id}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="accent-[#29CCB1]"
                />
                <span className="text-sm text-[#1A1A2E]">{method.label}</span>
              </label>
            ))}
            {deliveryMethod === "other" && (
              <input
                type="text"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="受け渡し方法を入力"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#29CCB1] focus:ring-2 focus:ring-[#29CCB1]/20 outline-none transition-all text-sm text-[#1A1A2E]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !title.trim() || !description.trim()}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#29CCB1] to-[#20B89E] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            {isEditing ? "更新中..." : "出品中..."}
          </span>
        ) : isEditing ? (
          "✏️ 更新する"
        ) : (
          "🎉 出品する"
        )}
      </button>
    </form>
  );
}
