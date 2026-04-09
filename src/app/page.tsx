"use client";

import { useUser } from "@/components/UserContext";
import { useState } from "react";
import LoginButton from "@/components/LoginButton";
import TabSwitch from "@/components/TabSwitch";
import ItemList from "@/components/ItemList";
import PostForm from "@/components/PostForm";

export default function Home() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "my">("buy");
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div className="space-y-6">
      <TabSwitch activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "buy" && (
        <ItemList
          key={`buy-${refreshKey}`}
          currentSlackId={user.slackId}
          category="all"
        />
      )}

      {activeTab === "sell" && (
        <PostForm
          onSuccess={() => {
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
        />
      )}
    </div>
  );
}
