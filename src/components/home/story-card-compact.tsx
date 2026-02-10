"use client";

import Link from "next/link";
import { BookOpen, Heart, BookMarked } from "lucide-react";
import type { RankedStory } from "@/lib/rankings";

interface StoryCardCompactProps {
  story: RankedStory;
  showProgress?: boolean;
  progress?: { chapter_number: number; total_chapters: number };
}

export function StoryCardCompact({ story, showProgress, progress }: StoryCardCompactProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Genre color mapping for gradient fallbacks
  const genreColors: Record<string, string> = {
    Fantasy: "from-purple-600/30 to-purple-900/50",
    "Sci-Fi": "from-cyan-600/30 to-cyan-900/50",
    Romance: "from-pink-600/30 to-pink-900/50",
    Mystery: "from-slate-600/30 to-slate-900/50",
    Horror: "from-red-800/30 to-red-950/50",
    LitRPG: "from-emerald-600/30 to-emerald-900/50",
    Historical: "from-amber-600/30 to-amber-900/50",
  };

  const primaryGenre = story.genres?.[0] || "Fantasy";
  const gradientClass = genreColors[primaryGenre] || genreColors.Fantasy;

  return (
    <Link 
      href={`/story/${story.id}`}
      className="group block flex-shrink-0 w-[160px] sm:w-[180px]"
    >
      <div className="relative overflow-hidden rounded-lg transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg">
        {/* Cover Image - 2:3 aspect ratio */}
        <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-muted">
          {story.cover_url ? (
            <img
              src={`${story.cover_url}?t=${new Date(story.updated_at || Date.now()).getTime()}`}
              alt={`Cover for ${story.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <BookOpen className="h-10 w-10 text-white/40" />
            </div>
          )}

          {/* Hover overlay with stats */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
            {story.genres && story.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {story.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 bg-white/20 rounded text-xs text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(story.follower_count || 0)}
              </span>
              <span className="flex items-center gap-1">
                <BookMarked className="h-3 w-3" />
                {story.chapter_count || 0} ch
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar for Continue Reading */}
        {showProgress && progress && progress.total_chapters > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, (progress.chapter_number / progress.total_chapters) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Title and Author */}
      <div className="mt-2 px-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {story.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          by {story.author?.display_name || story.author?.username || "Unknown"}
        </p>
      </div>
    </Link>
  );
}
