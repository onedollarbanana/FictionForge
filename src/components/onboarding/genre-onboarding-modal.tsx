"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Sword,
  Rocket,
  Heart,
  Skull,
  Search,
  Gamepad2,
  TrendingUp,
  Zap,
  Laugh,
  Theater,
  Flame,
  Compass,
  Coffee,
  Landmark,
  Shield,
  Sparkles,
  Building2,
  Cpu,
  RadioTower,
  Check,
} from "lucide-react";

const GENRES: { name: string; icon?: React.ElementType }[] = [
  { name: "Fantasy", icon: Sword },
  { name: "Sci-Fi", icon: Rocket },
  { name: "LitRPG", icon: Gamepad2 },
  { name: "Progression", icon: TrendingUp },
  { name: "Romance", icon: Heart },
  { name: "Horror", icon: Skull },
  { name: "Mystery", icon: Search },
  { name: "Thriller", icon: Zap },
  { name: "Comedy", icon: Laugh },
  { name: "Drama", icon: Theater },
  { name: "Action", icon: Flame },
  { name: "Adventure", icon: Compass },
  { name: "Slice of Life", icon: Coffee },
  { name: "Historical", icon: Landmark },
  { name: "Martial Arts", icon: Shield },
  { name: "Isekai", icon: Sparkles },
  { name: "Urban Fantasy", icon: Building2 },
  { name: "Cyberpunk", icon: Cpu },
  { name: "Post-Apocalyptic", icon: RadioTower },
  { name: "Superhero", icon: Zap },
];

interface GenreOnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

export function GenreOnboardingModal({
  userId,
  onComplete,
}: GenreOnboardingModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const saveAndClose = async (genres: string[]) => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          genre_preferences: genres,
          onboarding_completed: true,
        })
        .eq("id", userId);
      onComplete();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl mx-4 rounded-2xl border bg-background p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            What do you enjoy reading?
          </h2>
          <p className="text-muted-foreground">
            Pick at least 3 genres to personalize your experience
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {GENRES.map(({ name, icon: Icon }) => {
            const isSelected = selected.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleGenre(name)}
                className={`relative flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-150 cursor-pointer
                  ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "border-border bg-background hover:border-primary/50 hover:bg-accent"
                  }`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{name}</span>
                {isSelected && (
                  <Check className="ml-auto h-4 w-4 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => saveAndClose(selected)}
            disabled={selected.length < 3 || saving}
            size="lg"
            className="w-full max-w-xs"
          >
            {saving ? "Saving..." : `Continue (${selected.length}/3+)`}
          </Button>
          <button
            type="button"
            onClick={() => saveAndClose([])}
            disabled={saving}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
