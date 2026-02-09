"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Comment } from "./comment";
import { CommentInput } from "./comment-input";
import { MessageSquare } from "lucide-react";

interface ProfileData {
  username: string;
  avatar_url: string | null;
}

interface CommentData {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: ProfileData;
  replies?: CommentData[];
}

interface RawCommentData {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: ProfileData | ProfileData[] | null;
}

type SortOption = "newest" | "oldest" | "popular";

interface CommentListProps {
  chapterId: string;
  currentUserId: string | null;
  storyAuthorId: string;
}

// Helper to normalize profiles from Supabase (can be array or single object)
function normalizeProfile(profiles: ProfileData | ProfileData[] | null): ProfileData {
  if (!profiles) {
    return { username: "Anonymous", avatar_url: null };
  }
  if (Array.isArray(profiles)) {
    return profiles[0] || { username: "Anonymous", avatar_url: null };
  }
  return profiles;
}

export function CommentList({ chapterId, currentUserId, storyAuthorId }: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    
    let query = supabase
      .from("comments")
      .select(`
        id,
        content,
        likes,
        created_at,
        user_id,
        parent_id,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("chapter_id", chapterId);

    // Apply sorting
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortBy === "popular") {
      query = query.order("likes", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching comments:", error);
      setIsLoading(false);
      return;
    }

    // Organize comments into threads (parent comments with their replies)
    const commentMap = new Map<string, CommentData>();
    const topLevelComments: CommentData[] = [];
    const rawData = (data || []) as RawCommentData[];

    // First pass: create map of all comments with normalized profiles
    rawData.forEach((comment) => {
      const normalizedComment: CommentData = {
        ...comment,
        profiles: normalizeProfile(comment.profiles),
        replies: [],
      };
      commentMap.set(comment.id, normalizedComment);
    });

    // Second pass: organize into hierarchy
    rawData.forEach((comment) => {
      const fullComment = commentMap.get(comment.id)!;
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        commentMap.get(comment.parent_id)!.replies!.push(fullComment);
      } else if (!comment.parent_id) {
        topLevelComments.push(fullComment);
      }
    });

    setComments(topLevelComments);
    setIsLoading(false);
  }, [chapterId, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentPosted = () => {
    fetchComments();
  };

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Liked</option>
          </select>
        </div>
      </div>

      <CommentInput
        chapterId={chapterId}
        currentUserId={currentUserId}
        onCommentPosted={handleCommentPosted}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                chapterId={chapterId}
                storyAuthorId={storyAuthorId}
                onReplyPosted={handleCommentPosted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
