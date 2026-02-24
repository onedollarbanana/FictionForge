"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const GENRES = [
  { name: "Action", emoji: "⚔️", description: "High-octane thrills and combat" },
  { name: "Adventure", emoji: "🗺️", description: "Epic journeys and exploration" },
  { name: "Contemporary", emoji: "🏙️", description: "Modern-day stories and drama" },
  { name: "Cyberpunk", emoji: "🤖", description: "Neon-lit dystopian futures" },
  { name: "Fantasy", emoji: "🧙", description: "Magic, myths, and otherworldly realms" },
  { name: "Historical", emoji: "📜", description: "Stories from ages past" },
  { name: "Horror", emoji: "👻", description: "Terrifying tales and dark mysteries" },
  { name: "LitRPG", emoji: "🎮", description: "Game mechanics meet storytelling" },
  { name: "Mystery", emoji: "🔍", description: "Puzzles, clues, and whodunits" },
  { name: "Romance", emoji: "💕", description: "Love stories and heartfelt connections" },
  { name: "Sci-Fi", emoji: "🚀", description: "Space, technology, and the future" },
  { name: "Thriller", emoji: "🎯", description: "Suspense and edge-of-your-seat tension" },
  { name: "Urban Fantasy", emoji: "🌃", description: "Magic hidden in the modern world" },
];

export default function OnboardingGenresPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/onboarding/genres");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push("/library");
        return;
      }

      setChecking(false);
    }

    checkOnboarding();
  }, [supabase, router]);

  const toggleGenre = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleContinue = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        genre_preferences: selected,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving preferences:", error);
      setSaving(false);
      return;
    }

    router.push("/library");
    router.refresh();
  };

  const handleSkip = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
      })
      .eq("id", user.id);

    router.push("/library");
    router.refresh();
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">What do you love to read? 📚</h1>
          <p className="text-lg text-muted-foreground">
            Pick at least 3 genres so we can personalize your experience.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {GENRES.map((genre) => {
            const isSelected = selected.includes(genre.name);
            return (
              <button
                key={genre.name}
                onClick={() => toggleGenre(genre.name)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/20"
                    : "border-border bg-card hover:border-amber-500/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <span className="text-3xl">{genre.emoji}</span>
                <span className="font-semibold text-sm">{genre.name}</span>
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  {genre.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleContinue}
            disabled={selected.length < 3 || saving}
            className="w-full max-w-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-5"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : selected.length < 3 ? (
              `Pick ${3 - selected.length} more genre${3 - selected.length === 1 ? "" : "s"}`
            ) : (
              "Continue →"
            )}
          </Button>
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
