"use client";

interface TabSwitchProps {
  activeTab: "buy" | "sell" | "my";
  onTabChange: (tab: "buy" | "sell" | "my") => void;
}

export default function TabSwitch({ activeTab, onTabChange }: TabSwitchProps) {
  const tabs = [
    { id: "buy" as const, label: "🛒 購入・もらいたい", emoji: "🛒" },
    { id: "sell" as const, label: "📦 出品・譲りたい", emoji: "📦" },
    { id: "my" as const, label: "👤 マイ出品", emoji: "👤" },
  ];

  return (
    <div className="flex gap-1 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-emerald-100">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-[#29CCB1] text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-white/80"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
