"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";
import type { Announcement } from "@/types/database";

interface AnnouncementBannerProps {
  announcements: Announcement[];
  userId: string | null;
}

export function AnnouncementBanner({ announcements, userId }: AnnouncementBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [markedRead, setMarkedRead] = useState<string[]>([]);

  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id));
  const unreadCount = visibleAnnouncements.length;

  if (unreadCount === 0) return null;

  const markAsRead = async (announcementId: string) => {
    if (!userId || markedRead.includes(announcementId)) return;
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase
      .from("announcement_reads")
      .upsert({ user_id: userId, announcement_id: announcementId });
    
    setMarkedRead(prev => [...prev, announcementId]);
  };

  const handleExpand = () => {
    if (!expanded) {
      // Mark all as read when expanding
      visibleAnnouncements.forEach(a => markAsRead(a.id));
    }
    setExpanded(!expanded);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => [...prev, id]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  };

  return (
    <div className="mb-6">
      {/* Collapsed Banner */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span className="font-medium text-amber-800 dark:text-amber-200">
            {unreadCount === 1 
              ? "1 new announcement" 
              : `${unreadCount} new announcements`}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        )}
      </button>

      {/* Expanded Announcements */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {visibleAnnouncements.map(announcement => (
            <Card key={announcement.id} className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                      {announcement.title}
                    </h3>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {formatDate(announcement.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 shrink-0"
                  onClick={(e) => handleDismiss(announcement.id, e)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
