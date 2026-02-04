"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  title: string;
  blurb: string | null;
  status: string;
  genres: string[];
  tags: string[];
  chapter_count: number | null;
  total_word_count: number | null;
  total_views: number | null;
  follower_count: number | null;
  created_at: string;
  updated_at: string;
}

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  word_count: number | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function StoryOverviewPage() {
  const params = useParams();
  const storyId = params.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Load story
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .single();

      if (storyError) {
        console.error("Error loading story:", storyError);
        setError(storyError.message);
        setLoading(false);
        return;
      }

      setStory(storyData);

      // Load chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select("id, title, chapter_number, word_count, status, published_at, created_at")
        .eq("story_id", storyId)
        .order("chapter_number", { ascending: true });

      if (chaptersError) {
        console.error("Error loading chapters:", chaptersError);
      } else {
        setChapters(chaptersData || []);
      }

      setLoading(false);
    }

    if (storyId) {
      loadData();
    }
  }, [storyId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/author/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Story not found</h1>
        <Link href="/author/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/author/dashboard" className="text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Story Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm px-2 py-1 rounded bg-muted capitalize">
              {story.status}
            </span>
            {story.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="text-sm text-muted-foreground">
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/author/stories/${storyId}/edit`}>
            <Button variant="outline">Edit Story</Button>
          </Link>
          <Link href={`/author/stories/${storyId}/chapters/new`}>
            <Button>+ New Chapter</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Chapters</p>
          <p className="text-2xl font-bold">{story.chapter_count ?? 0}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Words</p>
          <p className="text-2xl font-bold">{(story.total_word_count ?? 0).toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Views</p>
          <p className="text-2xl font-bold">{(story.total_views ?? 0).toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Followers</p>
          <p className="text-2xl font-bold">{story.follower_count ?? 0}</p>
        </div>
      </div>

      {/* Blurb */}
      {story.blurb && (
        <div className="mb-8 p-4 rounded-lg border bg-card">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{story.blurb}</p>
        </div>
      )}

      {/* Chapters List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Chapters</h2>
        {chapters.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">No chapters yet</p>
            <Link href={`/author/stories/${storyId}/chapters/new`}>
              <Button>Write Your First Chapter</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/author/stories/${storyId}/chapters/${chapter.id}/edit`}
                className="block p-4 rounded-lg border bg-card hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground mr-2">
                      Ch. {chapter.chapter_number}
                    </span>
                    <span className="font-medium">{chapter.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{(chapter.word_count ?? 0).toLocaleString()} words</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        chapter.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {chapter.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
