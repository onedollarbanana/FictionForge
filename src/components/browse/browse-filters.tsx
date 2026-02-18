"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { TAGS } from "@/lib/constants";

const GENRES = [
  "Fantasy",
  "Sci-Fi", 
  "LitRPG",
  "Romance",
  "Horror",
  "Mystery",
  "Thriller",
  "Adventure",
  "Slice of Life",
  "Comedy",
  "Drama",
  "Action",
  "Historical",
  "Urban Fantasy",
  "Progression Fantasy",
];

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
  const currentSort = searchParams.get("sort") || "updated";
  const currentTags = searchParams.get("tag") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showTags, setShowTags] = useState(false);

  const selectedTags = currentTags ? currentTags.split(",").map(t => t.trim()) : [];

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    params.delete("page");
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  }, [router, searchParams]);

  const toggleTag = useCallback((tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    updateParams("tag", newTags.join(","));
  }, [selectedTags, updateParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("q", searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    updateParams("q", "");
  };

  const clearAllFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/browse");
    });
  };

  const hasActiveFilters = currentSearch || currentGenre || currentSort !== "updated" || currentTags;

  return (
    <div className="space-y-4 mb-8">
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
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
      </form>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Genre Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Genre:</span>
          <select
            value={currentGenre}
            onChange={(e) => updateParams("genre", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Genres</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}{genreCounts?.[genre] ? ` (${genreCounts[genre]})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTags(!showTags)}
          className="text-sm"
        >
          {showTags ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {showTags ? "Hide tags" : "Show tags"}
          {selectedTags.length > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
              {selectedTags.length}
            </span>
          )}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Tag Selector */}
      {showTags && (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Active filter indicator */}
      {isPending && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  );
}
