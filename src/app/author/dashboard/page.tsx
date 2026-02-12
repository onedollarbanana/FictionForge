"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/author/story-card";
import { DashboardStatsSkeleton, StoryListItemSkeleton } from "@/components/ui/skeleton";
import { Eye, Users, Heart, BookOpen, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Story {
  id: string;
  title: string;
  blurb: string | null;
  tagline: string | null;
  cover_url: string | null;
  status: string;
  created_at: string;
  chapter_count: number;
  total_word_count: number;
  total_views: number;
  follower_count: number;
}

interface AuthorStats {
  total_views: number;
  views_last_week: number;
  views_this_week: number;
  total_followers: number;
  followers_last_week: number;
  followers_this_week: number;
  total_likes: number;
  likes_last_week: number;
  likes_this_week: number;
  total_chapters: number;
  total_words: number;
  total_stories: number;
}

function StatCard({ 
  label, 
  value, 
  thisWeek, 
  lastWeek, 
  icon: Icon,
  formatValue = (v: number) => v.toLocaleString()
}: { 
  label: string;
  value: number;
  thisWeek?: number;
  lastWeek?: number;
  icon: React.ElementType;
  formatValue?: (v: number) => string;
}) {
  // Calculate percentage change
  let percentChange: number | null = null;
  let changeDirection: 'up' | 'down' | 'neutral' = 'neutral';
  
  if (thisWeek !== undefined && lastWeek !== undefined) {
    if (lastWeek === 0 && thisWeek > 0) {
      percentChange = 100;
      changeDirection = 'up';
    } else if (lastWeek > 0) {
      percentChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      changeDirection = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
    }
  }

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold">{formatValue(value)}</p>
      
      {percentChange !== null && (
        <div className="flex items-center gap-1 mt-1">
          {changeDirection === 'up' && (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+{percentChange}%</span>
            </>
          )}
          {changeDirection === 'down' && (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-500">{percentChange}%</span>
            </>
          )}
          {changeDirection === 'neutral' && (
            <>
              <Minus className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">0%</span>
            </>
          )}
          <span className="text-xs text-muted-foreground ml-1">vs last week</span>
        </div>
      )}
      
      {thisWeek !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">
          +{thisWeek.toLocaleString()} this week
        </p>
      )}
    </div>
  );
}

export default function AuthorDashboard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AuthorStats | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch author stats using RPC
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_author_stats', { author_uuid: user.id });

      if (statsError) {
        console.error("Error loading stats:", statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("author_id", user.id)
        .order("updated_at", { ascending: false });

      if (storiesError) {
        console.error("Error loading stories:", storiesError);
      } else {
        setStories(storiesData || []);
      }
      
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-9 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-28 bg-muted rounded animate-pulse" />
        </div>
        <div className="mb-8">
          <DashboardStatsSkeleton />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StoryListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Fallback stats if RPC fails
  const displayStats = stats || {
    total_views: stories.reduce((sum, s) => sum + (s.total_views || 0), 0),
    views_this_week: 0,
    views_last_week: 0,
    total_followers: stories.reduce((sum, s) => sum + (s.follower_count || 0), 0),
    followers_this_week: 0,
    followers_last_week: 0,
    total_likes: 0,
    likes_this_week: 0,
    likes_last_week: 0,
    total_chapters: stories.reduce((sum, s) => sum + (s.chapter_count || 0), 0),
    total_words: stories.reduce((sum, s) => sum + (s.total_word_count || 0), 0),
    total_stories: stories.length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Author Dashboard</h1>
        <Link href="/author/stories/new">
          <Button>+ New Story</Button>
        </Link>
      </div>

      {/* Stats Overview - Primary metrics with week comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Total Views" 
          value={displayStats.total_views}
          thisWeek={displayStats.views_this_week}
          lastWeek={displayStats.views_last_week}
          icon={Eye}
        />
        <StatCard 
          label="Followers" 
          value={displayStats.total_followers}
          thisWeek={displayStats.followers_this_week}
          lastWeek={displayStats.followers_last_week}
          icon={Users}
        />
        <StatCard 
          label="Total Likes" 
          value={displayStats.total_likes}
          thisWeek={displayStats.likes_this_week}
          lastWeek={displayStats.likes_last_week}
          icon={Heart}
        />
        <StatCard 
          label="Chapters Published" 
          value={displayStats.total_chapters}
          icon={BookOpen}
        />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span>Stories</span>
          </div>
          <p className="text-xl font-semibold">{displayStats.total_stories}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="text-base">📝</span>
            <span>Total Words</span>
          </div>
          <p className="text-xl font-semibold">{displayStats.total_words.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="text-base">📖</span>
            <span>Avg Words/Chapter</span>
          </div>
          <p className="text-xl font-semibold">
            {displayStats.total_chapters > 0 
              ? Math.round(displayStats.total_words / displayStats.total_chapters).toLocaleString()
              : '0'
            }
          </p>
        </div>
      </div>

      {/* Stories List */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Your Stories</h2>
      </div>
      
      {stories.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">No stories yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first story to get started
          </p>
          <Link href="/author/stories/new">
            <Button>Create Your First Story</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
