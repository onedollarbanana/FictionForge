"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GenrePicker } from "@/components/author/genre-picker";
import { CoverUpload } from "@/components/story/cover-upload";

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "On Hiatus" },
];

export default function NewStoryPage() {
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("ongoing");
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to create a story");
      setLoading(false);
      return;
    }

    const tagArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const { data, error: insertError } = await supabase
      .from("stories")
      .insert({
        author_id: user.id,
        title,
        blurb: blurb || null,
        cover_url: coverUrl,
        status,
        genres,
        tags: tagArray,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/author/stories/${data.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Story</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Cover Image</Label>
          <CoverUpload currentCoverUrl={coverUrl} onUpload={setCoverUrl} />
          <p className="text-xs text-muted-foreground">
            Recommended: 400x600px (2:3 ratio). You can add this later.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your story title"
            required
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blurb">Blurb / Description</Label>
          <Textarea
            id="blurb"
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="A short description of your story..."
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {blurb.length}/2000 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={status === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Genres (select up to 5)</Label>
          <GenrePicker selected={genres} onChange={setGenres} max={5} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="litrpg, progression, magic system (comma separated)"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated tags to help readers find your story
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? "Creating..." : "Create Story"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
