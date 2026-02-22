export const revalidate = 60
import { createClient } from "@/lib/supabase/server";
import {
  getCommunityPicksLeaderboard,
  getPastCommunityPicks,
} from "@/lib/community-picks";
import type { CommunityPickStory } from "@/lib/community-picks";
import { BrowseStoryCard } from "@/components/story/browse-story-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Info, Medal } from "lucide-react";

function formatMonthTitle(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function CommunityPicksPage() {
  const supabase = await createClient();
  const currentMonth = getCurrentMonth();

  const [leaderboard, pastPicks] = await Promise.all([
    getCommunityPicksLeaderboard(currentMonth, 20, supabase),
    getPastCommunityPicks(30, supabase),
  ]);

  // Group past picks by month
  const picksByMonth = new Map<string, CommunityPickStory[]>();
  for (const pick of pastPicks) {
    const month = pick.communityPickMonth || "unknown";
    if (!picksByMonth.has(month)) picksByMonth.set(month, []);
    picksByMonth.get(month)!.push(pick);
  }

  const monthTitle = formatMonthTitle(currentMonth);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="h-7 w-7 text-amber-500" />
        <h1 className="text-3xl font-bold">Community Picks</h1>
      </div>
      <p className="text-muted-foreground mb-8">{monthTitle}</p>

      {/* Info Section */}
      <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">How Community Picks work</p>
              <p>
                Readers with <Badge variant="secondary" className="text-xs">Regular</Badge> rank
                or higher (250+ XP) can nominate up to 3 stories per month. Stories must have at
                least 10,000 words. Top nominated stories become Community Picks!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Leaderboard */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-500" />
          Current Standings — {monthTitle}
        </h2>

        {leaderboard.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No nominations yet this month. Be the first to nominate a story!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {leaderboard.map((story, index) => (
              <div key={story.id} className="relative">
                <div className="absolute -left-1 -top-1 z-10 bg-amber-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                  {index + 1}
                </div>
                <BrowseStoryCard story={story} />
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    {story.nominationCount} {story.nominationCount === 1 ? "nomination" : "nominations"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Months Archive */}
      {picksByMonth.size > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-6">Past Community Picks</h2>
          {Array.from(picksByMonth.entries()).map(([month, picks]) => (
            <div key={month} className="mb-8">
              <h3 className="text-lg font-medium mb-3 text-muted-foreground">
                {formatMonthTitle(month)}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {picks.map((story) => (
                  <div key={story.id} className="relative">
                    <BrowseStoryCard story={story} />
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        {story.nominationCount} votes
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
