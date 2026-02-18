"use client";

import { cn } from "@/lib/utils";

interface CommunityPickBadgeProps {
  storyId?: string;
  className?: string;
  pickMonth?: string;
  showBadge?: boolean;
}

function formatPickMonth(pickMonth: string): string {
  try {
    const date = new Date(pickMonth + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  } catch {
    return "";
  }
}

export function CommunityPickBadge({
  className,
  pickMonth,
  showBadge = true,
}: CommunityPickBadgeProps) {
  if (!showBadge || !pickMonth) return null;

  const formattedMonth = formatPickMonth(pickMonth);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-md shadow-sm",
        className
      )}
    >
      🏆 Community Pick{formattedMonth ? ` — ${formattedMonth}` : ""}
    </div>
  );
}
