"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast";

interface AutoLibraryAddProps {
  storyId: string;
  chapterNumber: number;
}

/**
 * Auto-adds story to library as "Reading" when user reads chapter 2+
 * - Only triggers on chapter 2 or higher (not chapter 1)
 * - Only if story not already in library
 * - Shows toast with undo option
 * - Respects "Dropped" status - never auto-changes it
 */
export function AutoLibraryAdd({ storyId, chapterNumber }: AutoLibraryAddProps) {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only trigger on chapter 2+
    if (chapterNumber < 2 || hasChecked.current) return;
    hasChecked.current = true;

    async function checkAndAdd() {
      const supabase = createClient();
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check current library status
      const { data: existing } = await supabase
        .from("follows")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("story_id", storyId)
        .maybeSingle();

      // Already in library
      if (existing) {
        // If "Plan to Read" and they're reading chapter 2+, upgrade to "Reading"
        if (existing.status === "plan_to_read") {
          const { error } = await supabase
            .from("follows")
            .update({ 
              status: "reading", 
              notify_new_chapters: true,
              updated_at: new Date().toISOString() 
            })
            .eq("id", existing.id);

          if (!error) {
            showToast("Moved to Reading", "success");
          }
        }
        // Never auto-change "Dropped" status
        return;
      }

      // Not in library - add as "Reading"
      const { error } = await supabase
        .from("follows")
        .insert({
          user_id: user.id,
          story_id: storyId,
          status: "reading",
          notify_new_chapters: true,
        });

      if (!error) {
        showToast("Added to Library as Reading", "success");
      }
    }

    checkAndAdd();
  }, [storyId, chapterNumber]);

  // This component renders nothing
  return null;
}
