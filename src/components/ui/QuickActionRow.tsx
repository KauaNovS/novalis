"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

interface QuickActionItem {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

interface QuickActionRowProps {
  actions: QuickActionItem[];
}

export default function QuickActionRow({ actions }: QuickActionRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
        >
          <span className="text-gray-600">{action.icon}</span>
          <span className="flex-1 text-sm font-medium text-gray-800">
            {action.label}
          </span>
          <ExternalLink className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}