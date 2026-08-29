"use client";

type PillBadgeVariant = "solid" | "outline";

interface PillBadgeProps {
  text: string;
  variant?: PillBadgeVariant;
}

export default function PillBadge({
  text,
  variant = "solid",
}: PillBadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";

  const variantClasses =
    variant === "solid"
      ? "bg-gray-200 text-gray-800"
      : "border border-gray-300 text-gray-600";

  return <span className={`${baseClasses} ${variantClasses}`}>{text}</span>;
}