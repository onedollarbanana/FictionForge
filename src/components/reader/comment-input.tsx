"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface CommentInputProps {
  chapterId: string;
  currentUserId: string | null;
  onCommentPosted: () => void;
}

export function CommentInput({ chapterId, currentUserId, onCommentPosted }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!currentUserId) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Join the conversation!
        </p>
        <Button asChild size="sm">
          <Link href="/login">Log in to comment</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setError("");
    
    const supabase = createClient();
    
    const { error: insertError } = await supabase.from("comments").insert({
      chapter_id: chapterId,
      user_id: currentUserId,
      content: content.trim(),
    });

    if (insertError) {
      setError("Failed to post comment. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setIsSubmitting(false);
    onCommentPosted();
  };

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts on this chapter... (Use [spoiler]text[/spoiler] to hide spoilers)"
        className="w-full p-3 border rounded-lg resize-none bg-background min-h-[100px]"
        rows={3}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Tip: Wrap spoilers with [spoiler]...[/spoiler]
        </p>
        <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
}
