"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface MarkReadButtonProps {
  chapterId: string;
  storyId: string;
  userId: string | null;
}

export function MarkReadButton({ chapterId, storyId, userId }: MarkReadButtonProps) {
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkReadStatus = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("chapter_reads")
        .select("id")
        .eq("user_id", userId)
        .eq("chapter_id", chapterId)
        .single();

      setIsRead(!!data);
      setLoading(false);
    };

    checkReadStatus();
  }, [chapterId, userId]);

  const toggleRead = async () => {
    if (!userId) {
      showToast("Sign in to track your reading", "error");
      return;
    }

    const supabase = createClient();
    setLoading(true);

    if (isRead) {
      // Mark as unread
      const { error } = await supabase
        .from("chapter_reads")
        .delete()
        .eq("user_id", userId)
        .eq("chapter_id", chapterId);

      if (error) {
        showToast("Failed to update", "error");
      } else {
        setIsRead(false);
        showToast("Marked as unread", "success");
      }
    } else {
      // Mark as read
      const { error } = await supabase.from("chapter_reads").insert({
        user_id: userId,
        chapter_id: chapterId,
        story_id: storyId,
      });

      if (error && !error.code?.includes("23505")) {
        showToast("Failed to update", "error");
      } else {
        setIsRead(true);
        showToast("Marked as read ✓", "success");
      }
    }

    setLoading(false);
  };

  if (!userId) return null;

  return (
    <Button
      variant={isRead ? "default" : "outline"}
      size="sm"
      onClick={toggleRead}
      disabled={loading}
      className={isRead ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {isRead ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Read
        </>
      ) : (
        <>
          <BookOpen className="h-4 w-4 mr-1" />
          Mark as Read
        </>
      )}
    </Button>
  );
}
