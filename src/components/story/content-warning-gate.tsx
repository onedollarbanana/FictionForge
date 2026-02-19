"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ContentWarningGateProps {
  warnings: string[];
  storyTitle: string;
  children: React.ReactNode;
}

export function ContentWarningGate({ warnings, storyTitle, children }: ContentWarningGateProps) {
  const [accepted, setAccepted] = useState(false);
  const storageKey = `content-warning-accepted`;
  
  useEffect(() => {
    // Check if user has already accepted mature content warnings
    const stored = localStorage.getItem(storageKey);
    if (stored === "true") {
      setAccepted(true);
    }
  }, [storageKey]);
  
  if (accepted) return <>{children}</>;
  
  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Content Warning</h2>
      <p className="text-muted-foreground mb-4">
        <strong>{storyTitle}</strong> contains mature content:
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {warnings.map((w) => (
          <span key={w} className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {w.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        This content may not be suitable for all readers. You must confirm you wish to continue.
      </p>
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        <Button
          onClick={() => {
            localStorage.setItem(storageKey, "true");
            setAccepted(true);
          }}
        >
          I Understand, Continue
        </Button>
      </div>
    </div>
  );
}
