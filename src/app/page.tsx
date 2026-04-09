"use client";

import { useUser } from "@/components/UserContext";
import { useState } from "react";
import LoginButton from "@/components/LoginButton";
import TabSwitch from "@/components/TabSwitch";
import ItemList from "@/components/ItemList";
import PostForm from "@/components/PostForm";
import { Item } from "@/lib/db";

export default function Home() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "my">("buy");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editItem, setEditItem] = useState<Item | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin w-10 h-10 border-3 border-[#29CCB1] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginButton />;
  }

  const handleEdit = (item: Item) => {
    setEditItem(item);
    setActiveTab("sell");
  };

  return (
    <div className="space-y-6">
      <TabSwitch activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== "sell") setEditItem(null);
      }} />

      {activeTab === "buy" && (
        <ItemList
          key={`buy-${refreshKey}`}
          currentSlackId={user.slackId}
          category="all"
          onEdit={handleEdit}
        />
      )}

      {activeTab === "sell" && (
        <PostForm
          editItem={editItem}
          onCancelEdit={() => {
            setEditItem(null);
            setActiveTab("my");
          }}
          onSuccess={() => {
            setEditItem(null);
            setRefreshKey((k) => k + 1);
            setActiveTab("buy");
          }}
        />
      )}

      {activeTab === "my" && (
        <ItemList
          key={`my-${refreshKey}`}
          currentSlackId={user.slackId}
          category="all"
          myItems
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
