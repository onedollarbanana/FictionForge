"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ChapterLikeButtonProps {
  chapterId: string;
  initialLikes: number;
  currentUserId: string | null;
}

export function ChapterLikeButton({
  chapterId,
  initialLikes,
  currentUserId,
}: ChapterLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLike, setIsCheckingLike] = useState(true);
  const { showToast } = useToast();

  // Check if user has already liked this chapter
  useEffect(() => {
    if (!currentUserId) {
      setIsCheckingLike(false);
      return;
    }

    const checkLikeStatus = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("chapter_likes")
        .select("id")
        .eq("chapter_id", chapterId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      setIsLiked(!!data);
      setIsCheckingLike(false);
    };

    checkLikeStatus();
  }, [chapterId, currentUserId]);

  const handleLikeToggle = async () => {
    if (!currentUserId) {
      showToast("Please sign in to like chapters", "error");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("chapter_likes")
          .delete()
          .eq("chapter_id", chapterId)
          .eq("user_id", currentUserId);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase.from("chapter_likes").insert({
          chapter_id: chapterId,
          user_id: currentUserId,
        });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        showToast("Thanks for the feedback ❤️", "success");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="lg"
      onClick={handleLikeToggle}
      disabled={isLoading || isCheckingLike}
      className={`gap-2 ${isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
    >
      <Heart
        className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
      />
      <span>{likeCount.toLocaleString()}</span>
      <span className="sr-only">{isLiked ? "Unlike" : "Like"} this chapter</span>
    </Button>
  );
}
