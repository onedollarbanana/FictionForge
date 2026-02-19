import { Crown } from "lucide-react";

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium text-yellow-500 ${className || ""}`}>
      <Crown className="h-3 w-3" />
      Premium
    </span>
  );
}
