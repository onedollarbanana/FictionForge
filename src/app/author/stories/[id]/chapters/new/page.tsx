"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewChapterPage() {
  const params = useParams();
  const storyId = params.id as string;
  const [storyTitle, setStoryTitle] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorNote, setAuthorNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    async function loadStory() {
      const { data } = await supabase
        .from("stories")
        .select("title")
        .eq("id", storyId)
        .single();
      
      if (data) {
        setStoryTitle(data.title);
      }
    }
    loadStory();
  }, [storyId, supabase]);

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    // Get next chapter number
    const { data: chapters } = await supabase
      .from("chapters")
      .select("chapter_number")
      .eq("story_id", storyId)
      .order("chapter_number", { ascending: false })
      .limit(1);

    const nextChapterNumber = chapters && chapters.length > 0 
      ? chapters[0].chapter_number + 1 
      : 1;

    const { data, error: insertError } = await supabase
      .from("chapters")
      .insert({
        story_id: storyId,
        title,
        content,
        content_format: "plaintext",
        author_note: authorNote || null,
        chapter_number: nextChapterNumber,
        word_count: wordCount,
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Update story chapter count and word count
    // (In production, this would be a database trigger)
    const { data: allChapters } = await supabase
      .from("chapters")
      .select("word_count")
      .eq("story_id", storyId)
      .eq("status", "published");

    const totalWords = (allChapters || []).reduce((sum, ch) => sum + (ch.word_count || 0), 0);
    const publishedCount = (allChapters || []).length;

    await supabase
      .from("stories")
      .update({
        chapter_count: publishedCount,
        total_word_count: totalWords,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId);

    router.push(`/author/stories/${storyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href={`/author/stories/${storyId}`} className="text-muted-foreground hover:text-foreground">
            ← Back to {storyTitle || "Story"}
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">New Chapter</h1>

        <form className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter 1: The Beginning"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Content *</Label>
              <span className="text-sm text-muted-foreground">
                {wordCount.toLocaleString()} words
              </span>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your chapter here..."
              rows={20}
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Tip: The rich text editor is coming soon! For now, use plain text.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorNote">Author&apos;s Note (optional)</Label>
            <Textarea
              id="authorNote"
              value={authorNote}
              onChange={(e) => setAuthorNote(e.target.value)}
              placeholder="Add a note for your readers..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading || !title.trim() || !content.trim()}
              onClick={(e) => handleSubmit(e, false)}
            >
              {loading ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              disabled={loading || !title.trim() || !content.trim()}
              onClick={(e) => handleSubmit(e, true)}
            >
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
