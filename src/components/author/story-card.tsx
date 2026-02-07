"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface Story {
  id: string;
  title: string;
  blurb: string | null;
  cover_url: string | null;
  status: string;
  created_at: string;
  chapter_count: number;
  total_word_count: number | null;
  total_views: number | null;
  follower_count: number | null;
}

interface StoryCardProps {
  story: Story;
}

const statusColors: Record<string, string> = {
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  hiatus: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export function StoryCard({ story }: StoryCardProps) {
  const statusLabel = story.status.charAt(0).toUpperCase() + story.status.slice(1);
  
  return (
    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        {/* Cover Thumbnail */}
        <Link href={`/author/stories/${story.id}`} className="shrink-0">
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

        <div className="flex justify-between items-start gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                href={`/author/stories/${story.id}`}
                className="text-lg font-semibold hover:text-primary truncate"
              >
                {story.title}
              </Link>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[story.status] || statusColors.ongoing}`}>
                {statusLabel}
              </span>
            </div>
            
            {story.blurb && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {story.blurb}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>{story.chapter_count ?? 0} chapters</span>
              <span>{(story.total_word_count ?? 0).toLocaleString()} words</span>
              <span>{(story.total_views ?? 0).toLocaleString()} views</span>
              <span>{story.follower_count ?? 0} followers</span>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Link href={`/author/stories/${story.id}`}>
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
            <Link href={`/author/stories/${story.id}/chapters/new`}>
              <Button size="sm">+ Chapter</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
