"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ReadingProgressTrackerProps {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  userId: string | null;
}

export function ReadingProgressTracker({
  storyId,
  chapterId,
  chapterNumber,
  userId,
}: ReadingProgressTrackerProps) {
  useEffect(() => {
    if (!userId) return;

    const updateProgress = async () => {
      const supabase = createClient();

      // Check existing progress
      const { data: existing } = await supabase
        .from("reading_progress")
        .select("id, chapter_number")
        .eq("user_id", userId)
        .eq("story_id", storyId)
        .single();

      // Only update if this is a higher chapter than previously read
      if (existing && chapterNumber <= existing.chapter_number) {
        return;
      }

      if (existing) {
        // Update existing progress
        await supabase
          .from("reading_progress")
          .update({
            chapter_id: chapterId,
            chapter_number: chapterNumber,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert new progress
        await supabase.from("reading_progress").insert({
          user_id: userId,
          story_id: storyId,
          chapter_id: chapterId,
          chapter_number: chapterNumber,
        });
      }
    };

    // Small delay to avoid updating on quick page bounces
    const timer = setTimeout(updateProgress, 2000);
    return () => clearTimeout(timer);
  }, [storyId, chapterId, chapterNumber, userId]);

  // This component renders nothing - it's just for tracking
  return null;
}
