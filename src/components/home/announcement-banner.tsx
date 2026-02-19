'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Info, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

const typeStyles: Record<string, { bg: string; icon: React.ElementType }> = {
  info: {
    bg: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
    icon: Info,
  },
  warning: {
    bg: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
    icon: CheckCircle,
  },
  maintenance: {
    bg: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-800',
    icon: Wrench,
  },
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchBanner() {
      const supabase = createClient();
      const now = new Date().toISOString();

      const { data } = await supabase
        .from('system_announcements')
        .select('id, title, message, type')
        .eq('is_active', true)
        .eq('show_banner', true)
        .lte('starts_at', now)
        .or(`ends_at.is.null,ends_at.gt.${now}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const dismissedKey = `dismissed_announcement_${data.id}`;
        if (typeof window !== 'undefined' && localStorage.getItem(dismissedKey)) {
          return;
        }
        setAnnouncement(data);
      }
    }

    fetchBanner();
  }, []);

  function handleDismiss() {
    if (announcement) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');
    }
    setDismissed(true);
  }

  if (!announcement || dismissed) return null;

  const style = typeStyles[announcement.type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border py-3 px-4 mb-6 ${style.bg}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-sm">{announcement.title}</span>
            <span className="text-sm ml-2">{announcement.message}</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
