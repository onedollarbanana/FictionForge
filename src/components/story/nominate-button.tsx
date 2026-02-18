"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import {
  getUserNominations,
  nominateStory,
  removeNomination,
  canUserNominate,
} from "@/lib/community-picks-client";
import { COMMUNITY_PICK_MIN_WORDS, COMMUNITY_PICK_MAX_VOTES_PER_MONTH } from "@/lib/constants";

interface NominateButtonProps {
  storyId: string;
  storyWordCount: number;
}

export function NominateButton({ storyId, storyWordCount }: NominateButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isNominated, setIsNominated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [canNominate, setCanNominate] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const [nominationsUsed, setNominationsUsed] = useState(0);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // Check eligibility
      const eligibility = await canUserNominate(user.id);
      setCanNominate(eligibility.canNominate);
      setReason(eligibility.reason);
      setNominationsUsed(eligibility.nominationsUsed);

      // Check if already nominated this story
      const nominations = await getUserNominations(user.id);
      const alreadyNominated = nominations.some((n) => n.story_id === storyId);
      setIsNominated(alreadyNominated);

      // If already nominated this story, they can still un-nominate
      if (alreadyNominated) {
        setCanNominate(true);
      }

      setLoading(false);
    }

    init();
  }, [storyId]);

  if (loading || !userId) return null;

  // Check word count minimum
  if (storyWordCount < COMMUNITY_PICK_MIN_WORDS) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-muted-foreground text-xs">
        <Trophy className="h-3.5 w-3.5 mr-1" />
        Min {(COMMUNITY_PICK_MIN_WORDS / 1000).toFixed(0)}K words to be nominated
      </Button>
    );
  }

  const handleClick = async () => {
    setActing(true);
    try {
      if (isNominated) {
        const result = await removeNomination(storyId);
        if (!result.error) {
          setIsNominated(false);
          setNominationsUsed((prev) => prev - 1);
          setCanNominate(true);
          setReason(undefined);
        }
      } else {
        const result = await nominateStory(storyId);
        if (!result.error) {
          setIsNominated(true);
          const newUsed = nominationsUsed + 1;
          setNominationsUsed(newUsed);
          if (newUsed >= COMMUNITY_PICK_MAX_VOTES_PER_MONTH) {
            setCanNominate(false);
            setReason(`${COMMUNITY_PICK_MAX_VOTES_PER_MONTH}/${COMMUNITY_PICK_MAX_VOTES_PER_MONTH} nominations used`);
          }
        }
      }
    } finally {
      setActing(false);
    }
  };

  if (!canNominate && !isNominated) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-muted-foreground text-xs">
        <Trophy className="h-3.5 w-3.5 mr-1" />
        {reason || "Cannot nominate"}
      </Button>
    );
  }

  return (
    <Button
      variant={isNominated ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={acting}
      className={isNominated ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
    >
      <Trophy className="h-3.5 w-3.5 mr-1" />
      {acting
        ? "..."
        : isNominated
        ? "Nominated ✓"
        : `Nominate (${nominationsUsed}/${COMMUNITY_PICK_MAX_VOTES_PER_MONTH} used)`}
    </Button>
  );
}
