"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Megaphone, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";
import type { Announcement } from "@/types/database";

interface AnnouncementBannerProps {
  announcements: Announcement[];
  unreadIds: string[];
  userId: string | null;
}

export function AnnouncementBanner({ announcements, unreadIds, userId }: AnnouncementBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [markedRead, setMarkedRead] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Calculate which announcements are unread (not in reads and not dismissed)
  const isUnread = (id: string) => unreadIds.includes(id) && !markedRead.includes(id);
  
  // Get visible announcements based on showAll toggle
  const unreadAnnouncements = announcements.filter(a => isUnread(a.id) && !dismissed.includes(a.id));
  const readAnnouncements = announcements.filter(a => !isUnread(a.id));
  
  const visibleAnnouncements = showAll 
    ? announcements.filter(a => !dismissed.includes(a.id))
    : unreadAnnouncements;

  const unreadCount = unreadAnnouncements.length;

  // Show banner if there are unread announcements OR if user has toggled to show all
  if (unreadCount === 0 && !showAll && readAnnouncements.length === 0) return null;

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
      // Mark all visible as read when expanding
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
      {/* Collapsed Banner - shows when there are unread announcements */}
      {(unreadCount > 0 || showAll) && (
        <button
          onClick={handleExpand}
          className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-800 dark:text-amber-200">
              {showAll 
                ? `${visibleAnnouncements.length} announcement${visibleAnnouncements.length === 1 ? "" : "s"}`
                : unreadCount === 1 
                  ? "1 new announcement" 
                  : `${unreadCount} new announcements`
              }
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          )}
        </button>
      )}

      {/* Show Past Announcements toggle when collapsed and no unread */}
      {unreadCount === 0 && !showAll && readAnnouncements.length > 0 && (
        <button
          onClick={() => {
            setShowAll(true);
            setExpanded(true);
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <History className="h-4 w-4" />
          View past announcements ({readAnnouncements.length})
        </button>
      )}

      {/* Expanded Announcements */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {visibleAnnouncements.map(announcement => {
            const isRead = !isUnread(announcement.id);
            return (
              <Card 
                key={announcement.id} 
                className={`p-4 ${
                  isRead 
                    ? "border-muted bg-muted/30" 
                    : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isRead ? "text-foreground" : "text-amber-900 dark:text-amber-100"}`}>
                        {announcement.title}
                      </h3>
                      <span className={`text-xs ${isRead ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}`}>
                        {formatDate(announcement.created_at)}
                      </span>
                      {isRead && (
                        <span className="text-xs text-muted-foreground">(read)</span>
                      )}
                    </div>
                    <p className={`text-sm whitespace-pre-wrap ${isRead ? "text-muted-foreground" : "text-amber-800 dark:text-amber-200"}`}>
                      {announcement.content}
                    </p>
                  </div>
                  {!isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 shrink-0"
                      onClick={(e) => handleDismiss(announcement.id, e)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          
          {/* Toggle to show/hide past announcements */}
          {expanded && readAnnouncements.length > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
            >
              <History className="h-4 w-4" />
              {showAll ? "Hide past announcements" : `Show ${readAnnouncements.length} past announcement${readAnnouncements.length === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
