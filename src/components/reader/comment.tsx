"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CommentData {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  replies?: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  currentUserId: string | null;
  chapterId: string;
  storyAuthorId: string;
  onReplyPosted: () => void;
  isReply?: boolean;
}

export function Comment({ 
  comment, 
  currentUserId, 
  chapterId, 
  storyAuthorId,
  onReplyPosted,
  isReply = false 
}: CommentProps) {
  const isAuthor = comment.user_id === storyAuthorId;
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes ?? 0);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());

  const renderContent = () => {
    const content = comment.content;
    const spoilerRegex = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/g;
    const parts: (string | { type: 'spoiler'; content: string; index: number })[] = [];
    let lastIndex = 0;
    let match;
    let spoilerIndex = 0;

    while ((match = spoilerRegex.exec(content)) !== null) {
      // Add text before spoiler
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      // Add spoiler
      parts.push({ type: 'spoiler', content: match[1], index: spoilerIndex });
      spoilerIndex++;
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    if (parts.length === 1 && typeof parts[0] === 'string') {
      return content;
    }

    return parts.map((part, i) => {
      if (typeof part === 'string') {
        return <span key={i}>{part}</span>;
      }
      const isRevealed = revealedSpoilers.has(part.index);
      return (
        <span
          key={i}
          onClick={() => {
            const newSet = new Set(revealedSpoilers);
            if (isRevealed) {
              newSet.delete(part.index);
            } else {
              newSet.add(part.index);
            }
            setRevealedSpoilers(newSet);
          }}
          className={`cursor-pointer px-1 rounded transition-colors ${
            isRevealed 
              ? "bg-muted" 
              : "bg-foreground text-foreground hover:bg-muted/80"
          }`}
        >
          {isRevealed ? part.content : "SPOILER"}
        </span>
      );
    });
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    
    // Optimistic update
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    
    // In a real app, we'd update the database here
    // For MVP, just toggle locally
  };

  const handleReply = async () => {
    if (!currentUserId || !replyContent.trim()) return;
    
    setIsSubmitting(true);
    const supabase = createClient();
    
    const { error } = await supabase.from("comments").insert({
      chapter_id: chapterId,
      user_id: currentUserId,
      parent_id: comment.id,
      content: replyContent.trim(),
    });

    if (!error) {
      setReplyContent("");
      setShowReplyInput(false);
      onReplyPosted();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className={`${isReply ? "ml-8 border-l-2 pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium shrink-0">
          {comment.profiles?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.profiles?.username || "Anonymous"}</span>
            {isAuthor && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-primary/20 text-primary">
                Author
              </span>
            )}
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">{renderContent()}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleLike}
              disabled={!currentUserId}
            >
              <Heart className={`h-3 w-3 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {likesCount}
            </Button>
            
            {!isReply && currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {showReplyInput && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 text-sm border rounded-md resize-none bg-background"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={isSubmitting || !replyContent.trim()}>
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReplyInput(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  chapterId={chapterId}
                  storyAuthorId={storyAuthorId}
                  onReplyPosted={onReplyPosted}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
