"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverUpload } from "@/components/story/cover-upload";

const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Mystery",
  "Horror",
  "Thriller",
  "LitRPG",
  "Progression",
  "Isekai",
  "Slice of Life",
  "Adventure",
  "Action",
  "Comedy",
  "Drama",
  "Historical",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditStoryPage({ params }: PageProps) {
  const { id: storyId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("ongoing");
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStory() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .single();

      if (error || !data) {
        router.push("/author/dashboard");
        return;
      }

      setTitle(data.title);
      setBlurb(data.blurb || "");
      setCoverUrl(data.cover_url || null);
      setStatus(data.status || "ongoing");
      setGenres(data.genres || []);
      setTags((data.tags || []).join(", "));
      setInitialLoading(false);
    }

    loadStory();
  }, [storyId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const tagArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const { error: updateError } = await supabase
      .from("stories")
      .update({
        title,
        blurb: blurb || null,
        cover_url: coverUrl,
        status,
        genres,
        tags: tagArray,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/author/stories/${storyId}`);
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Story</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="My Awesome Story"
          />
        </div>

        <div>
          <Label htmlFor="blurb">Blurb / Description</Label>
          <Textarea
            id="blurb"
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="A short description of your story..."
            rows={4}
          />
        </div>

        <CoverUpload
          storyId={storyId}
          currentCoverUrl={coverUrl}
          onUpload={setCoverUrl}
        />

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="hiatus">Hiatus</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Genres (select up to 3)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  if (genres.includes(genre)) {
                    setGenres(genres.filter((g) => g !== genre));
                  } else if (genres.length < 3) {
                    setGenres([...genres, genre]);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  genres.includes(genre)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="time-loop, slow-burn, op-mc"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Add tags to help readers find your story
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/author/stories/${storyId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
