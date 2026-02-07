"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown, Check, BookOpen, CheckCircle, XCircle } from "lucide-react";

type FollowStatus = "reading" | "finished" | "dropped";

interface FollowButtonProps {
  storyId: string;
  initialFollowerCount?: number;
}

const STATUS_OPTIONS: { value: FollowStatus; label: string; icon: React.ReactNode }[] = [
  { value: "reading", label: "Reading", icon: <BookOpen className="h-4 w-4" /> },
  { value: "finished", label: "Finished", icon: <CheckCircle className="h-4 w-4" /> },
  { value: "dropped", label: "Dropped", icon: <XCircle className="h-4 w-4" /> },
];

export function FollowButton({ storyId, initialFollowerCount = 0 }: FollowButtonProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [status, setStatus] = useState<FollowStatus>("reading");
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load current follow state on mount
  useEffect(() => {
    async function loadFollowState() {
      const supabase = createClient();
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user follows this story
      const { data: follow } = await supabase
        .from("follows")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("story_id", storyId)
        .single();

      if (follow) {
        setIsFollowing(true);
        setStatus(follow.status as FollowStatus);
      }
      
      setLoading(false);
    }

    loadFollowState();
  }, [storyId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-follow-dropdown]")) {
        setShowDropdown(false);
      }
    }
    
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  async function handleFollow() {
    if (!userId) {
      // Redirect to login
      router.push(`/login?redirect=/story/${storyId}`);
      return;
    }

    setActionLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("follows")
        .insert({
          user_id: userId,
          story_id: storyId,
          status: "reading",
        });

      if (error) throw error;

      setIsFollowing(true);
      setStatus("reading");
      setFollowerCount((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to follow:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnfollow() {
    if (!userId) return;

    setActionLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("user_id", userId)
        .eq("story_id", storyId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
      setShowDropdown(false);
    } catch (err) {
      console.error("Failed to unfollow:", err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(newStatus: FollowStatus) {
    if (!userId) return;

    setActionLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("follows")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("story_id", storyId);

      if (error) throw error;

      setStatus(newStatus);
      setShowDropdown(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <Heart className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // Not following - show Follow button
  if (!isFollowing) {
    return (
      <Button
        variant="outline"
        onClick={handleFollow}
        disabled={actionLoading}
      >
        <Heart className="h-4 w-4 mr-2" />
        {actionLoading ? "Following..." : `Follow (${followerCount.toLocaleString()})`}
      </Button>
    );
  }

  // Following - show status dropdown
  const currentStatus = STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="relative" data-follow-dropdown>
      <Button
        variant="default"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={actionLoading}
        className="gap-2"
      >
        <Heart className="h-4 w-4 fill-current" />
        {currentStatus.label}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <div className="absolute top-full mt-1 right-0 z-50 min-w-[180px] bg-popover border rounded-md shadow-lg py-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors"
            >
              {option.icon}
              <span className="flex-1">{option.label}</span>
              {status === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
          
          <div className="border-t my-1" />
          
          <button
            onClick={handleUnfollow}
            className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            Unfollow
          </button>
        </div>
      )}
    </div>
  );
}
