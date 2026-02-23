"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

interface ChapterNavProps {
  storyUrl: string;
  currentChapter: number;
  totalChapters: number;
  prevChapterUrl?: string;
  nextChapterUrl?: string;
}

export function ChapterNav({
  storyUrl,
  currentChapter,
  totalChapters,
  prevChapterUrl,
  nextChapterUrl,
}: ChapterNavProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t border-b">
      <Button
        variant="outline"
        asChild
        disabled={!prevChapterUrl}
        className={!prevChapterUrl ? "opacity-50 pointer-events-none" : ""}
      >
        <Link href={prevChapterUrl || "#"}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={storyUrl}>
            <List className="h-4 w-4 mr-1" />
            Chapter {currentChapter} of {totalChapters}
          </Link>
        </Button>
      </div>

      <Button
        variant="outline"
        asChild
        disabled={!nextChapterUrl}
        className={!nextChapterUrl ? "opacity-50 pointer-events-none" : ""}
      >
        <Link href={nextChapterUrl || "#"}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
