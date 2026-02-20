import Link from "next/link";
import { Crown } from "lucide-react";

// Compact CTA for sidebars and settings
export function PremiumUpsellCompact() {
  return (
    <Link
      href="/premium"
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 transition-colors"
    >
      <Crown className="h-4 w-4" />
      <span>Go Premium</span>
    </Link>
  );
}

// Inline CTA for use within page content
export function PremiumUpsellInline() {
  return (
    <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4 flex items-start gap-3">
      <Crown className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          Upgrade to Reader Premium
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Ad-free reading, premium badge, and more — from $2.50/mo
        </p>
        <Link
          href="/premium"
          className="inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline"
        >
          Learn more →
        </Link>
      </div>
    </div>
  );
}
