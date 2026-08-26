"use client";

import { Star } from "lucide-react";

type InfoItemType = "text" | "tag" | "rating";

interface InfoItem {
  label: string;
  value: string;
  type?: InfoItemType;
  rating?: number; // 0-5
}

interface InfoListCardProps {
  title: string;
  items: InfoItem[];
}

export default function InfoListCard({ title, items }: InfoListCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      <div className="mt-4 divide-y divide-gray-200">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-gray-500">{item.label}</span>

            {item.type === "rating" ? (
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-4 w-4 ${
                      starIndex < (item.rating ?? 0)
                        ? "fill-gray-800 text-gray-800"
                        : "text-gray-300"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            ) : item.type === "tag" ? (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                {item.value}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-800">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}