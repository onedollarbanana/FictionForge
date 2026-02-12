"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Eye, Users, Heart } from "lucide-react";

interface Story {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  cover_image_url: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
  chapter_count: number;
  word_count: number;
  total_views: number;
  total_likes: number;
  follower_count: number;
  rating_average: number | null;
  rating_count: number | null;
}

interface StoryCardProps {
  story: Story;
}

const statusColors: Record<string, string> = {
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  hiatus: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  dropped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function AuthorStoryCard({ story }: StoryCardProps) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
      {/* Cover */}
      <Link href={`/story/${story.id}`} className="shrink-0">
        {story.cover_image_url ? (
          <div className="relative w-20 h-28 rounded-lg overflow-hidden">
            <Image
              src={story.cover_image_url}
              alt={story.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-zinc-400" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/story/${story.id}`}>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1">
                {story.title}
              </h3>
            </Link>
            {story.tagline && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                {story.tagline}
              </p>
            )}
          </div>
          <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[story.status] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'}`}>
            {story.status}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {story.chapter_count} ch
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {(story.total_views ?? 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {(story.follower_count ?? 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {(story.total_likes ?? 0).toLocaleString()}
          </span>
          {(story.rating_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {story.rating_average?.toFixed(1)}
              <span className="text-zinc-400">({story.rating_count})</span>
            </span>
          )}
          <span className="text-zinc-400">
            {(story.word_count ?? 0).toLocaleString()} words
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link href={`/author/stories/${story.id}/edit`}>
            <Button variant="outline" size="sm">Edit Story</Button>
          </Link>
          <Link href={`/author/stories/${story.id}/chapters`}>
            <Button variant="outline" size="sm">Chapters</Button>
          </Link>
          <Link href={`/story/${story.id}`}>
            <Button variant="ghost" size="sm">View</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
