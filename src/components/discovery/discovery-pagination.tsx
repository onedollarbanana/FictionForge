"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function DiscoveryPagination({ currentPage, totalPages, basePath }: Props) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Previous
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">← Previous</span>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Next →
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Next →</span>
      )}
    </div>
  );
}
