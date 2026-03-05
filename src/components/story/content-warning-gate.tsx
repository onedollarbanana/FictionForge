"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldX } from "lucide-react";
import { CONTENT_WARNINGS } from "@/lib/content-warnings";

interface ContentWarningGateProps {
  contentRating: string | null | undefined;
  warnings: string[];
  storyTitle: string;
  children: React.ReactNode;
}

// Per-story acceptance keys (readers confirm once per story)
function getStorageKey(storyTitle: string, rating: string) {
  return `cw-accepted:${storyTitle}:${rating}`;
}

function getWarningLabel(value: string): string {
  return CONTENT_WARNINGS.find(w => w.value === value)?.label ?? value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function ContentWarningGate({ contentRating, warnings, storyTitle, children }: ContentWarningGateProps) {
  const [accepted, setAccepted] = useState(false);

  const isMature = contentRating === "mature";
  const isAdult = contentRating === "adult_18";
  const needsGate = isMature || isAdult;

  const storageKey = needsGate ? getStorageKey(storyTitle, contentRating!) : null;

  useEffect(() => {
    if (!storageKey) {
      setAccepted(true);
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (stored === "true") setAccepted(true);
  }, [storageKey]);

  if (!needsGate || accepted) return <>{children}</>;

  const accept = () => {
    if (storageKey) localStorage.setItem(storageKey, "true");
    setAccepted(true);
  };

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      {isAdult ? (
        <ShieldX className="h-12 w-12 text-red-500 mx-auto mb-4" />
      ) : (
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      )}

      <h2 className="text-xl font-bold mb-2">
        {isAdult ? "Adult Content (18+)" : "Mature Content"}
      </h2>

      <p className="text-muted-foreground mb-4">
        <strong>{storyTitle}</strong> is rated{" "}
        <span className={`font-semibold ${isAdult ? "text-red-500" : "text-amber-500"}`}>
          {isAdult ? "Adult 18+" : "Mature"}
        </span>
        {warnings.length > 0 && " and contains:"}
      </p>

      {warnings.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {warnings.map(w => (
            <span
              key={w}
              className={`px-3 py-1 rounded-full text-sm ${
                isAdult
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              }`}
            >
              {getWarningLabel(w)}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-6">
        {isAdult
          ? "This story contains adult content. By continuing you confirm you are 18 years of age or older."
          : "This story contains mature content. Please confirm you wish to continue."}
      </p>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button
          onClick={accept}
          className={isAdult ? "bg-red-500 hover:bg-red-600" : ""}
        >
          {isAdult ? "I am 18+ — Continue" : "I Understand, Continue"}
        </Button>
      </div>
    </div>
  );
}
