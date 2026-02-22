"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ViewTrackerProps {
  chapterId: string;
  storyId: string;
}

export function ViewTracker({ chapterId, storyId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per component mount
    if (tracked.current) return;
    tracked.current = true;

    const trackView = async () => {
      const supabase = createClient();

      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // Generate a session ID for anonymous users
      let sessionId = localStorage.getItem("fictionry_session");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("fictionry_session", sessionId);
      }

      // Try to insert a view (will fail silently if already exists due to unique constraint)
      const { error: viewError } = await supabase.from("chapter_views").insert({
        chapter_id: chapterId,
        story_id: storyId,
        user_id: user?.id || null,
        session_id: user ? null : sessionId,
      });

      // Ignore unique constraint violations - that's expected
      if (viewError && !viewError.code?.includes("23505")) {
        console.error("Error tracking view:", viewError);
      }

      // Auto-mark as read for logged-in users (Royal Road style)
      if (user) {
        const { error: readError } = await supabase.from("chapter_reads").insert({
          chapter_id: chapterId,
          story_id: storyId,
          user_id: user.id,
        });

        // Ignore unique constraint violations - already marked as read
        if (readError && !readError.code?.includes("23505")) {
          console.error("Error marking as read:", readError);
        }
      }
    };

    // Small delay to avoid counting quick bounces
    const timer = setTimeout(trackView, 3000);
    return () => clearTimeout(timer);
  }, [chapterId, storyId]);

  return null;
}
