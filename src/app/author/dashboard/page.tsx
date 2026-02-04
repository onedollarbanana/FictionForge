"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/author/story-card";

interface Story {
  id: string;
  title: string;
  blurb: string | null;
  status: string;
  created_at: string;
  chapter_count: number;
  total_word_count: number;
  total_views: number;
  follower_count: number;
}

export default function AuthorDashboard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStories: 0,
    totalChapters: 0,
    totalWords: 0,
    totalViews: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    async function loadStories() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("author_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading stories:", error);
        return;
      }

      const storiesData = data || [];
      setStories(storiesData);
      
      // Calculate stats
      setStats({
        totalStories: storiesData.length,
        totalChapters: storiesData.reduce((sum, s) => sum + (s.chapter_count || 0), 0),
        totalWords: storiesData.reduce((sum, s) => sum + (s.total_word_count || 0), 0),
        totalViews: storiesData.reduce((sum, s) => sum + (s.total_views || 0), 0),
      });
      
      setLoading(false);
    }

    loadStories();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Author Dashboard</h1>
          <Link href="/author/stories/new">
            <Button>+ New Story</Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Stories</p>
            <p className="text-2xl font-bold">{stats.totalStories}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Chapters</p>
            <p className="text-2xl font-bold">{stats.totalChapters}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Total Words</p>
            <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Stories List */}
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
              <StoryCard key={story.id} story={story as Story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
