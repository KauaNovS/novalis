"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CollapsibleItem {
  title: string;
  content: string;
}

interface CollapsibleListCardProps {
  title: string;
  count: number;
  items: CollapsibleItem[];
  actionLabel?: string;
  onAction?: () => void;
}

export default function CollapsibleListCard({
  title,
  count,
  items,
  actionLabel,
  onAction,
}: CollapsibleListCardProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {count}
          </span>
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800">
                  {item.title}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.5}
                />
              </button>

              {isOpen && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-600">{item.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}