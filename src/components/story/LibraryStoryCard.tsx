"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { StatusDropdown } from "./StatusDropdown";

type FollowStatus = "reading" | "finished" | "dropped";

interface LibraryStoryCardProps {
  follow: {
    id: string;
    status: string;
    story: {
      id: string;
      title: string;
      slug: string;
      blurb: string | null;
      cover_url: string | null;
      chapter_count: number | null;
      author: {
        username: string;
      } | null;
    };
  };
  onRemove?: () => void;
}

export function LibraryStoryCard({ follow, onRemove }: LibraryStoryCardProps) {
  const [removed, setRemoved] = useState(false);
  const story = follow.story;

  if (removed || !story) return null;

  function handleUnfollow() {
    setRemoved(true);
    onRemove?.();
  }

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <Link href={`/story/${story.id}`} className="shrink-0">
        {story.cover_url ? (
          <img
            src={story.cover_url}
            alt={story.title}
            className="w-16 h-24 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={`/story/${story.id}`}>
          <h3 className="font-semibold truncate hover:underline">{story.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          by {story.author?.username || "Unknown"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {story.chapter_count || 0} chapters
        </p>
      </div>
      
      <div className="shrink-0 self-center">
        <StatusDropdown
          followId={follow.id}
          storyId={story.id}
          currentStatus={follow.status as FollowStatus}
          onUnfollow={handleUnfollow}
        />
      </div>
    </div>
  );
}
