"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { X, UserCircle } from "lucide-react";

const DISMISS_KEY = "fictionry_profile_banner_dismissed";

export function ProfileCompletionBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check if already dismissed
    if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY)) {
      setLoading(false);
      return;
    }

    async function checkProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, bio")
        .eq("id", user.id)
        .single();

      if (profile && (!profile.avatar_url || !profile.bio)) {
        setVisible(true);
      }

      setLoading(false);
    }

    checkProfile();
  }, [supabase]);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY, "true");
    }
  };

  if (loading || !visible) return null;

  return (
    <div className="relative mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <div className="shrink-0 mt-0.5">
          <UserCircle className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="font-medium text-sm">
            Complete your profile to stand out! ✨
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add a photo and bio so other readers and authors can get to know you.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center mt-2 text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
          >
            Go to profile settings →
          </Link>
        </div>
      </div>
    </div>
  );
}
