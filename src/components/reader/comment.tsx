"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Pin, Pencil, Trash2, MoreVertical, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GiveRepButton } from "@/components/reputation";

interface CommentData {
  id: string;
  content: string;
  likes: number;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  is_pinned?: boolean;
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
  onCommentUpdated?: () => void;
  isReply?: boolean;
}

const EDIT_TIME_LIMIT_MINUTES = 15;

export function Comment({ 
  comment, 
  currentUserId, 
  chapterId, 
  storyAuthorId,
  onReplyPosted,
  onCommentUpdated,
  isReply = false 
}: CommentProps) {
  const isAuthor = comment.user_id === storyAuthorId;
  const isOwnComment = currentUserId === comment.user_id;
  const isStoryAuthor = currentUserId === storyAuthorId;
  
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes ?? 0);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  
  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Menu state
  const [showMenu, setShowMenu] = useState(false);

  // Can edit within 15 minutes
  const createdAt = new Date(comment.created_at);
  const canEdit = isOwnComment && (Date.now() - createdAt.getTime()) < EDIT_TIME_LIMIT_MINUTES * 60 * 1000;
  const canDelete = isOwnComment;
  const canPin = isStoryAuthor && !isReply;

  const renderContent = (content: string) => {
    // Handle @mentions
    const mentionRegex = /@(\w+)/g;
    // Handle spoilers
    const spoilerRegex = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/g;
    
    // First pass: extract spoilers
    const parts: (string | { type: 'spoiler' | 'mention'; content: string; index?: number })[] = [];
    let lastIndex = 0;
    let match;
    let spoilerIndex = 0;

    // Process spoilers first
    const spoilerMatches: { start: number; end: number; content: string; index: number }[] = [];
    
    while ((match = spoilerRegex.exec(content)) !== null) {
      spoilerMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        index: spoilerIndex++
      });
    }
    
    // Build parts array
    lastIndex = 0;
    for (const spoiler of spoilerMatches) {
      if (spoiler.start > lastIndex) {
        parts.push(content.slice(lastIndex, spoiler.start));
      }
      parts.push({ type: 'spoiler', content: spoiler.content, index: spoiler.index });
      lastIndex = spoiler.end;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    if (parts.length === 0) {
      parts.push(content);
    }

    // Render with mentions and spoilers
    return parts.map((part, i) => {
      if (typeof part === 'string') {
        // Process @mentions in text
        const mentionParts = part.split(mentionRegex);
        return mentionParts.map((mp, j) => {
          if (j % 2 === 1) {
            // This is a username
            return (
              <Link
                key={`${i}-${j}`}
                href={`/profile/${mp}`}
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                @{mp}
              </Link>
            );
          }
          return <span key={`${i}-${j}`}>{mp}</span>;
        });
      }
      
      if (part.type === 'spoiler') {
        const isRevealed = revealedSpoilers.has(part.index!);
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              const newSet = new Set(revealedSpoilers);
              if (isRevealed) {
                newSet.delete(part.index!);
              } else {
                newSet.add(part.index!);
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
      }
      
      return null;
    });
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
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

  const handlePin = async () => {
    if (!canPin) return;
    
    const supabase = createClient();
    const newPinnedState = !comment.is_pinned;
    
    // If pinning, first unpin all other comments on this chapter
    if (newPinnedState) {
      await supabase
        .from("comments")
        .update({ is_pinned: false })
        .eq("chapter_id", chapterId)
        .eq("is_pinned", true);
    }
    
    // Then set this comment's pinned state
    const { error } = await supabase
      .from("comments")
      .update({ is_pinned: newPinnedState })
      .eq("id", comment.id);
    
    if (!error && onCommentUpdated) {
      onCommentUpdated();
    }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim() || !canEdit) return;
    
    setIsEditSubmitting(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("comments")
      .update({ 
        content: editContent.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", comment.id);
    
    if (!error) {
      setIsEditing(false);
      if (onCommentUpdated) onCommentUpdated();
    }
    setIsEditSubmitting(false);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id);
    
    if (!error && onCommentUpdated) {
      onCommentUpdated();
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`${isReply ? "ml-8 border-l-2 pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <Link 
          href={`/profile/${comment.profiles?.username}`}
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium shrink-0 hover:ring-2 hover:ring-primary/50 transition-all"
        >
          {comment.profiles?.username?.[0]?.toUpperCase() || "?"}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link 
              href={`/profile/${comment.profiles?.username}`}
              className="font-medium hover:text-primary hover:underline transition-colors"
            >
              {comment.profiles?.username || "Anonymous"}
            </Link>
            {isAuthor && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-primary/20 text-primary">
                Author
              </span>
            )}
            {comment.is_pinned && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            )}
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            
            {/* Menu for pin/edit/delete */}
            {(canPin || canEdit || canDelete) && !isEditing && (
              <div className="relative ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border rounded-md shadow-lg py-1 min-w-[120px]">
                      {canPin && (
                        <button
                          onClick={handlePin}
                          className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Pin className="h-3 w-3" />
                          {comment.is_pinned ? "Unpin" : "Pin"}
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => { setIsEditing(true); setShowMenu(false); }}
                          className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                          className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Edit mode */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border rounded-md resize-none bg-white dark:bg-zinc-900"
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleEdit} 
                  disabled={isEditSubmitting || !editContent.trim()}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isEditSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap break-words">{renderContent(comment.content)}</p>
          )}
          
          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200 mb-2">Delete this comment?</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {!isEditing && !showDeleteConfirm && (
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

              <GiveRepButton
                targetType="comment"
                targetId={comment.id}
                receiverUserId={comment.user_id}
                currentUserId={currentUserId}
              />
              
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
          )}

          {showReplyInput && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 text-sm border rounded-md resize-none bg-white dark:bg-zinc-900"
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
                  onCommentUpdated={onCommentUpdated}
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
