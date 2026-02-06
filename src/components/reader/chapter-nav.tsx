"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

interface ChapterNavProps {
  storyId: string;
  currentChapter: number;
  totalChapters: number;
  prevChapterId?: string;
  nextChapterId?: string;
}

export function ChapterNav({
  storyId,
  currentChapter,
  totalChapters,
  prevChapterId,
  nextChapterId,
}: ChapterNavProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t border-b">
      <Button
        variant="outline"
        asChild
        disabled={!prevChapterId}
        className={!prevChapterId ? "opacity-50 pointer-events-none" : ""}
      >
        <Link href={prevChapterId ? `/story/${storyId}/chapter/${prevChapterId}` : "#"}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/story/${storyId}`}>
            <List className="h-4 w-4 mr-1" />
            Chapter {currentChapter} of {totalChapters}
          </Link>
        </Button>
      </div>

      <Button
        variant="outline"
        asChild
        disabled={!nextChapterId}
        className={!nextChapterId ? "opacity-50 pointer-events-none" : ""}
      >
        <Link href={nextChapterId ? `/story/${storyId}/chapter/${nextChapterId}` : "#"}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
