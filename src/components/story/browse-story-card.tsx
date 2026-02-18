"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Eye, Heart, BookMarked, Clock, Star, Plus, Minus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { StoryCardData } from "./story-card";

const statusColors: Record<string, string> = {
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  hiatus: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
};

const genreGradients: Record<string, string> = {
  Fantasy: "from-purple-600/30 to-purple-900/50",
  "Sci-Fi": "from-cyan-600/30 to-cyan-900/50",
  Romance: "from-pink-600/30 to-pink-900/50",
  Mystery: "from-slate-600/30 to-slate-900/50",
  Horror: "from-red-800/30 to-red-950/50",
  LitRPG: "from-emerald-600/30 to-emerald-900/50",
  Historical: "from-amber-600/30 to-amber-900/50",
  Adventure: "from-orange-600/30 to-orange-900/50",
  Thriller: "from-gray-600/30 to-gray-900/50",
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getAuthorName(story: StoryCardData): string {
  if (story.author?.display_name) return story.author.display_name;
  if (story.author?.username) return story.author.username;
  if (story.profiles?.display_name) return story.profiles.display_name;
  if (story.profiles?.username) return story.profiles.username;
  return "Unknown";
}

function getAuthorUsername(story: StoryCardData): string | null {
  return story.author?.username || story.profiles?.username || null;
}

interface BrowseStoryCardProps {
  story: StoryCardData;
  className?: string;
}

export function BrowseStoryCard({ story, className }: BrowseStoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const primaryGenre = story.genres?.[0] || "Fantasy";
  const gradientClass = genreGradients[primaryGenre] || genreGradients.Fantasy;
  const authorUsername = getAuthorUsername(story);
  const imageTimestamp = story.updated_at
    ? new Date(story.updated_at).getTime()
    : "v1";

  const MAX_VISIBLE_TAGS = 3;
  const allTags = story.tags || [];
  const visibleTags = expanded ? allTags : allTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = allTags.length - MAX_VISIBLE_TAGS;

  return (
    <div
      className={cn(
        "flex gap-4 p-4 border rounded-lg bg-card hover:border-primary/30 transition-colors relative",
        className
      )}
    >
      {/* Cover Image */}
      <Link href={`/story/${story.id}`} className="shrink-0">
        {story.cover_url ? (
          <div className="relative w-24 h-36 sm:w-28 sm:h-40">
            <Image
              src={`${story.cover_url}?t=${imageTimestamp}`}
              alt={`Cover for ${story.title}`}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover rounded-md"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={cn(
              "w-24 h-36 sm:w-28 sm:h-40 rounded-md flex items-center justify-center bg-gradient-to-br",
              gradientClass
            )}
          >
            <BookOpen className="h-8 w-8 text-white/40" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title + Status row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/story/${story.id}`}>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                {story.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              {authorUsername ? (
                <Link
                  href={`/author/${authorUsername}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  by {getAuthorName(story)}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  by {getAuthorName(story)}
                </p>
              )}
              {story.status && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    statusColors[story.status] || statusColors.ongoing
                  )}
                >
                  {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Genres */}
        {story.genres && story.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {story.genres.map((genre) => (
              <Link key={genre} href={`/browse/genre/${encodeURIComponent(genre)}`}>
                <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                  {genre}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title="Followers">
            <Users className="h-3 w-3" />
            {formatNumber(story.follower_count ?? 0)}
          </span>
          <span className="flex items-center gap-1" title="Chapters">
            <BookMarked className="h-3 w-3" />
            {story.chapter_count || 0} chapters
          </span>
          <span className="flex items-center gap-1" title="Views">
            <Eye className="h-3 w-3" />
            {formatNumber(story.total_views ?? 0)}
          </span>
          {story.rating_average && Number(story.rating_average) > 0 && (
            <span
              className="flex items-center gap-0.5 text-amber-500 font-medium"
              title={`${story.rating_count || 0} ratings`}
            >
              <Star className="h-3 w-3 fill-current" />
              {Number(story.rating_average).toFixed(1)}
            </span>
          )}
          {story.updated_at && (
            <span className="flex items-center gap-1" title="Last updated">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(story.updated_at), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        {/* Blurb */}
        {(story.tagline || story.blurb) && (
          <p
            className={cn(
              "text-sm text-muted-foreground mt-2",
              !expanded && "line-clamp-2"
            )}
          >
            {story.tagline && (
              <span className="font-medium text-foreground/80">
                {story.tagline}
                {story.blurb && expanded ? " — " : ""}
              </span>
            )}
            {expanded ? story.blurb : !story.tagline ? story.blurb : null}
          </p>
        )}

        {/* Tags (shown below blurb) */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {visibleTags.map((tag) => (
              <Link key={tag} href={`/browse/tag/${encodeURIComponent(tag)}`}>
                <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                  #{tag}
                </span>
              </Link>
            ))}
            {!expanded && hiddenTagCount > 0 && (
              <button
                onClick={() => setExpanded(true)}
                className="px-2 py-0.5 bg-muted rounded text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                +{hiddenTagCount} more
              </button>
            )}
          </div>
        )}

        {/* Expanded: extra details */}
        {expanded && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
            {story.created_at && (
              <span>
                Published:{" "}
                {new Date(story.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {story.rating_count !== undefined && story.rating_count !== null && story.rating_count > 0 && (
              <span>{story.rating_count} ratings</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
