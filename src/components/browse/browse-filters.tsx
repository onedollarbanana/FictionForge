"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  PRIMARY_GENRES,
  SUBGENRES,
  TAG_GROUPS,
  CONTENT_RATINGS,
  STORY_FORMATS,
} from "@/lib/constants";

// ── Curated Tropes & Relationship picks shown in the main section ──────────────
// High-signal tags from Romantic & Relationship Elements + Tropes & Story Patterns
const CURATED_TROPES_SLUGS = [
  'slow-burn',
  'enemies-to-lovers',
  'friends-to-lovers',
  'found-family',
  'fated-mates',
  'forced-proximity',
  'reincarnation',
  'regression',
  'time-loop',
  'revenge-plot',
  'redemption-arc',
  'dungeon-diving',
];

const CURATED_TROPES = (() => {
  const romanticsGroup = TAG_GROUPS.find(g => g.slug === 'romantic-relationship');
  const tropesGroup = TAG_GROUPS.find(g => g.slug === 'tropes-story-patterns');
  const allTags = [
    ...(romanticsGroup?.tags ?? []),
    ...(tropesGroup?.tags ?? []),
  ];
  return CURATED_TROPES_SLUGS.map(slug => allTags.find(t => t.slug === slug)).filter(Boolean) as typeof allTags;
})();

// Groups shown under "More Filters"
const MORE_FILTER_GROUP_SLUGS = [
  'character-pov',
  'plot-structure',
  'world-setting',
  'power-progression',
  'representation',
];
const MORE_FILTER_GROUPS = TAG_GROUPS.filter(g => MORE_FILTER_GROUP_SLUGS.includes(g.slug));

const GENRE_COLORS: Record<string, string> = {
  'fantasy': 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  'science-fiction': 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  'horror': 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  'romance': 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
  'thriller-mystery': 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  'action-adventure': 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  'comedy-satire': 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  'contemporary-fiction': 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  'historical-fiction': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'literary-fiction': 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  'paranormal-supernatural': 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  'non-fiction-essay': 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30',
  'fan-fiction': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
};

const SORT_OPTIONS = [
  { value: "updated", label: "Recently Updated" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "followers", label: "Most Followed" },
  { value: "rating", label: "Highest Rated" },
];

interface BrowseFiltersProps {
  genreCounts?: Record<string, number>;
}

export function BrowseFilters({ genreCounts }: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentGenre = searchParams.get("genre") || "";
  const currentSubgenre = searchParams.get("subgenre") || "";
  const currentSort = searchParams.get("sort") || "updated";
  const currentRating = searchParams.get("rating") || "";
  const currentFormat = searchParams.get("format") || "";
  const currentTagsParam = searchParams.get("tag") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const selectedTags = currentTagsParam ? currentTagsParam.split(",").map(t => t.trim()) : [];

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  }, [router, searchParams]);

  const toggleTag = useCallback((slug: string) => {
    const newTags = selectedTags.includes(slug)
      ? selectedTags.filter(t => t !== slug)
      : [...selectedTags, slug];
    updateParams({ tag: newTags.join(",") });
  }, [selectedTags, updateParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/browse");
    });
  };

  const hasActiveFilters = currentSearch || currentGenre || currentSubgenre ||
    currentRating || currentFormat || currentTagsParam || currentSort !== "updated";

  const activeTagCount = selectedTags.length +
    (currentGenre ? 1 : 0) +
    (currentSubgenre ? 1 : 0) +
    (currentRating ? 1 : 0) +
    (currentFormat ? 1 : 0);

  // Subgenres for the currently-selected genre
  const subgenresForGenre = currentGenre ? (SUBGENRES[currentGenre] ?? []) : [];

  return (
    <div className="space-y-5 mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or author..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); updateParams({ q: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isPending}>Search</Button>
      </form>

      {/* ── Genre Pills ── */}
      <div>
        <div className="overflow-x-auto">
          <div className="flex overflow-x-auto md:flex-wrap md:overflow-x-visible pb-2 md:pb-0 gap-2 [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => updateParams({ genre: "", subgenre: "" })}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                !currentGenre
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
              }`}
            >
              All Genres
            </button>
            {PRIMARY_GENRES.map((genre) => {
              const isActive = currentGenre === genre.slug;
              const count = genreCounts?.[genre.slug];
              return (
                <button
                  key={genre.slug}
                  onClick={() => updateParams({
                    genre: isActive ? "" : genre.slug,
                    subgenre: "",
                  })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? (GENRE_COLORS[genre.slug] || 'bg-primary/15 text-primary border-primary/30') + ' ring-2 ring-primary/30'
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  {genre.emoji} {genre.name}
                  {count ? <span className="ml-1 opacity-60">({count})</span> : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subgenres — shown only when a genre is selected */}
        {currentGenre && subgenresForGenre.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subgenresForGenre.map((sub) => {
              const isActive = currentSubgenre === sub.slug;
              return (
                <button
                  key={sub.slug}
                  onClick={() => updateParams({ subgenre: isActive ? "" : sub.slug })}
                  title={sub.description}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                    isActive
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content Rating + Format + Sort Row ── */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-start">
        {/* Content Rating */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">Rating</p>
          <div className="flex gap-1.5 flex-wrap">
            {['', ...CONTENT_RATINGS.map(r => r.value)].map((val) => {
              const rating = CONTENT_RATINGS.find(r => r.value === val);
              const label = rating?.label ?? 'All';
              const isActive = currentRating === val;
              return (
                <button
                  key={val || 'all'}
                  onClick={() => updateParams({ rating: isActive && val ? "" : val })}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    isActive
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Format */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">Format</p>
          <div className="flex gap-1.5 flex-wrap">
            {STORY_FORMATS.map((fmt) => {
              const isActive = currentFormat === fmt.value;
              return (
                <button
                  key={fmt.value}
                  onClick={() => updateParams({ format: isActive ? "" : fmt.value })}
                  title={fmt.description}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    isActive
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">Sort</p>
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tone & Mood (all 17, expanded) ── */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Tone & Mood</p>
        <div className="flex flex-wrap gap-1.5">
          {TAG_GROUPS.find(g => g.slug === 'tone-mood')?.tags.map((tag) => {
            const isActive = selectedTags.includes(tag.slug);
            return (
              <button
                key={tag.slug}
                onClick={() => toggleTag(tag.slug)}
                title={tag.description}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tropes & Relationship (curated 12, expanded) ── */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Tropes & Relationship</p>
        <div className="flex flex-wrap gap-1.5">
          {CURATED_TROPES.map((tag) => {
            const isActive = selectedTags.includes(tag.slug);
            return (
              <button
                key={tag.slug}
                onClick={() => toggleTag(tag.slug)}
                title={tag.description}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── More Filters toggle ── */}
      <div>
        <button
          type="button"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showMoreFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showMoreFilters ? 'Fewer filters' : 'More filters'}
          {MORE_FILTER_GROUPS.some(g =>
            g.tags.some(t => selectedTags.includes(t.slug))
          ) && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
              {MORE_FILTER_GROUPS.flatMap(g => g.tags).filter(t => selectedTags.includes(t.slug)).length}
            </span>
          )}
        </button>

        {showMoreFilters && (
          <div className="mt-3 space-y-4 pl-0">
            {MORE_FILTER_GROUPS.map((group) => (
              <div key={group.slug}>
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag) => {
                    const isActive = selectedTags.includes(tag.slug);
                    return (
                      <button
                        key={tag.slug}
                        onClick={() => toggleTag(tag.slug)}
                        title={tag.description}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Active filters summary + clear ── */}
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all filters
            {activeTagCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs ml-0.5">
                {activeTagCount}
              </span>
            )}
          </button>
        )}
        {isPending && (
          <span className="text-sm text-muted-foreground">Loading...</span>
        )}
      </div>
    </div>
  );
}
