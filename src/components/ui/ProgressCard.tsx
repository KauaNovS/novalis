"use client";

interface ProgressCardProps {
  label: string;
  percentage: number;
  pendingText?: string;
}

export default function ProgressCard({
  label,
  percentage,
  pendingText,
}: ProgressCardProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <span className="text-lg font-semibold text-gray-900">
          {clampedPercentage}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gray-800 transition-all"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {pendingText && (
        <p className="mt-2 text-xs text-gray-500">{pendingText}</p>
      )}
    </div>
  );
}