"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { CONTENT_WARNINGS } from "@/lib/content-warnings";

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

export default function EditStoryPage() {
  const params = useParams();
  const storyId = params.id as string;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [blurb, setBlurb] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("ongoing");
  const [visibility, setVisibility] = useState("published");
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [defaultNoteBefore, setDefaultNoteBefore] = useState("");
  const [defaultNoteAfter, setDefaultNoteAfter] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [hideCommunityBadge, setHideCommunityBadge] = useState(false);
  const [releaseSchedule, setReleaseSchedule] = useState("");
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);

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
      setTagline(data.tagline || "");
      setBlurb(data.blurb || "");
      setCoverUrl(data.cover_url || null);
      setStatus(data.status || "ongoing");
      setVisibility(data.visibility || "published");
      setGenres(data.genres || []);
      setTags((data.tags || []).join(", "));
      setDefaultNoteBefore(data.default_author_note_before || "");
      setDefaultNoteAfter(data.default_author_note_after || "");
      setHideCommunityBadge(data.hide_community_badge || false);
      setReleaseSchedule(data.release_schedule || "");
      setContentWarnings(data.content_warnings || []);
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
        tagline: tagline || null,
        blurb: blurb || null,
        cover_url: coverUrl,
        status,
        visibility,
        genres,
        tags: tagArray,
        default_author_note_before: defaultNoteBefore || null,
        default_author_note_after: defaultNoteAfter || null,
        hide_community_badge: hideCommunityBadge,
        release_schedule: releaseSchedule || null,
        content_warnings: contentWarnings.length > 0 ? contentWarnings : null,
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
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g., Dark fantasy meets post-apocalyptic Pokemon"
            maxLength={100}
          />
          <p className="text-sm text-muted-foreground mt-1">
            A punchy one-liner that sells your story ({tagline.length}/100)
          </p>
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
          <Label htmlFor="visibility">Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {visibility === 'published' && 'Visible in browse and search'}
            {visibility === 'draft' && 'Only visible to you'}
            {visibility === 'unlisted' && 'Only accessible via direct link'}
            {visibility === 'removed' && 'Hidden from all readers'}
          </p>
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

        {/* Content Warnings */}
        <div className="space-y-2">
          <Label>Content Warnings</Label>
          <p className="text-xs text-muted-foreground">Select any that apply to help readers make informed choices</p>
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_WARNINGS.map((warning) => (
              <label key={warning.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={contentWarnings.includes(warning.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setContentWarnings([...contentWarnings, warning.value]);
                    } else {
                      setContentWarnings(contentWarnings.filter(w => w !== warning.value));
                    }
                  }}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                />
                {warning.label}
              </label>
            ))}
          </div>
        </div>

        {/* Release Schedule */}
        <div className="space-y-2">
          <Label htmlFor="releaseSchedule">Release Schedule</Label>
          <Input
            id="releaseSchedule"
            value={releaseSchedule}
            onChange={(e) => setReleaseSchedule(e.target.value)}
            placeholder="e.g., New chapters every Monday & Thursday"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Shown on your story page to let readers know when to expect new chapters
          </p>
        </div>

        {/* Community Pick Badge Setting */}
        <div className="border-t pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Community Pick</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!hideCommunityBadge}
              onChange={(e) => setHideCommunityBadge(!e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div>
              <span className="text-sm font-medium">Show Community Pick badge on story cover</span>
              <p className="text-sm text-muted-foreground">
                If your story is selected as a Community Pick, a badge will appear on the cover
              </p>
            </div>
          </label>
        </div>

        {/* Default Author Notes Section */}
        <div className="border-t pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Default Author Notes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These notes will be automatically added to new chapters. You can edit them per-chapter.
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="defaultNoteBefore">Default Note (Before Chapter)</Label>
              <Textarea
                id="defaultNoteBefore"
                value={defaultNoteBefore}
                onChange={(e) => setDefaultNoteBefore(e.target.value)}
                placeholder="e.g., Thanks for reading! Consider leaving a review if you're enjoying the story."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="defaultNoteAfter">Default Note (After Chapter)</Label>
              <Textarea
                id="defaultNoteAfter"
                value={defaultNoteAfter}
                onChange={(e) => setDefaultNoteAfter(e.target.value)}
                placeholder="e.g., Join my Patreon for early chapters! Next chapter drops Tuesday."
                rows={3}
              />
            </div>
          </div>
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
