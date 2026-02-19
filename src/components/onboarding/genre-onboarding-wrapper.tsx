"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GenreOnboardingModal } from "./genre-onboarding-modal";

export function GenreOnboardingWrapper() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        setUserId(user.id);
        setShowOnboarding(true);
      }
    }
    check();
  }, []);

  if (!showOnboarding || !userId) return null;
  return (
    <GenreOnboardingModal
      userId={userId}
      onComplete={() => setShowOnboarding(false)}
    />
  );
}
