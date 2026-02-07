"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, BookOpen, CheckCircle, XCircle, Trash2 } from "lucide-react";

type FollowStatus = "reading" | "finished" | "dropped";

interface StatusDropdownProps {
  followId: string;
  storyId: string;
  currentStatus: FollowStatus;
  onStatusChange?: (newStatus: FollowStatus) => void;
  onUnfollow?: () => void;
}

const STATUS_OPTIONS: { value: FollowStatus; label: string; icon: React.ReactNode }[] = [
  { value: "reading", label: "Reading", icon: <BookOpen className="h-4 w-4" /> },
  { value: "finished", label: "Finished", icon: <CheckCircle className="h-4 w-4" /> },
  { value: "dropped", label: "Dropped", icon: <XCircle className="h-4 w-4" /> },
];

export function StatusDropdown({ 
  followId, 
  storyId, 
  currentStatus, 
  onStatusChange,
  onUnfollow 
}: StatusDropdownProps) {
  const [status, setStatus] = useState<FollowStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  async function handleStatusChange(newStatus: FollowStatus) {
    if (newStatus === status) {
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("follows")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", followId);

      if (error) throw error;

      setStatus(newStatus);
      onStatusChange?.(newStatus);
      setShowDropdown(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnfollow() {
    if (!confirm("Remove this story from your library?")) return;

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("id", followId);

      if (error) throw error;

      onUnfollow?.();
      setShowDropdown(false);
    } catch (err) {
      console.error("Failed to unfollow:", err);
    } finally {
      setLoading(false);
    }
  }

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="relative" onClick={(e) => e.preventDefault()}>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        disabled={loading}
        className="gap-1 text-xs h-8"
      >
        {currentOption.icon}
        <span className="hidden sm:inline">{currentOption.label}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(false);
            }}
          />
          
          <div className="absolute top-full mt-1 right-0 z-50 min-w-[160px] bg-popover border rounded-md shadow-lg py-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleStatusChange(option.value);
                }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnfollow();
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}
