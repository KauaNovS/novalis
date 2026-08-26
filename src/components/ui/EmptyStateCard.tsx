"use client";

import type { ReactNode } from "react";

interface EmptyStateCardProps {
  title: string;
  emptyMessage: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export default function EmptyStateCard({
  title,
  emptyMessage,
  actionLabel,
  onAction,
  icon,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {actionLabel && (
          <button
            onClick={onAction}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        {icon && <div className="mb-3 text-gray-300">{icon}</div>}
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    </div>
  );
}