"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, Star } from "lucide-react";

interface Story {
  id: string;
  title: string;
  blurb: string | null;
  tagline: string | null;
  cover_url: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
  chapter_count: number;
  total_word_count: number | null;
  total_views: number | null;
  follower_count: number | null;
  rating_average?: number | null;
  rating_count?: number | null;
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
  
  // Use updated_at for cache busting
  const imageTimestamp = story.updated_at 
    ? new Date(story.updated_at).getTime() 
    : 'v1';
  
  return (
    <div className="p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        {/* Cover Thumbnail */}
        <Link href={`/author/stories/${story.id}`} className="shrink-0">
          {story.cover_url ? (
            <div className="relative w-16 h-24">
              <Image
                src={`${story.cover_url}?t=${imageTimestamp}`}
                alt={story.title}
                fill
                sizes="64px"
                className="object-cover rounded"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </Link>

        <div className="flex justify-between items-start gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <Link 
                href={`/author/stories/${story.id}`}
                className="text-lg font-semibold hover:text-primary line-clamp-2 flex-1"
              >
                {story.title}
              </Link>
              <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${statusColors[story.status] || statusColors.ongoing}`}>
                {statusLabel}
              </span>
            </div>
            
            {story.tagline && (
              <p className="text-sm text-primary/80 italic mb-1">
                {story.tagline}
              </p>
            )}
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
              {story.rating_average && story.rating_average > 0 && (
                <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {Number(story.rating_average).toFixed(1)}
                  <span className="text-muted-foreground font-normal">({story.rating_count || 0})</span>
                </span>
              )}
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
