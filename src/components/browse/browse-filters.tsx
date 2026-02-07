"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

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
];

export function BrowseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentGenre = searchParams.get("genre") || "";
  const currentSort = searchParams.get("sort") || "updated";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  }, [router, searchParams]);

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

  const hasActiveFilters = currentSearch || currentGenre || currentSort !== "updated";

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
                {genre}
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

      {/* Active filter indicator */}
      {isPending && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
    </div>
  );
}
