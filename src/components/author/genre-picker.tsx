"use client";

import { Button } from "@/components/ui/button";

const GENRES = [
  "Fantasy",
  "Sci-Fi", 
  "LitRPG",
  "Progression",
  "Romance",
  "Horror",
  "Mystery",
  "Thriller",
  "Comedy",
  "Drama",
  "Action",
  "Adventure",
  "Slice of Life",
  "Historical",
  "Martial Arts",
  "Isekai",
  "Urban Fantasy",
  "Cyberpunk",
  "Post-Apocalyptic",
  "Superhero",
];

interface GenrePickerProps {
  selected: string[];
  onChange: (genres: string[]) => void;
  max?: number;
}

export function GenrePicker({ selected, onChange, max = 5 }: GenrePickerProps) {
  const toggleGenre = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else if (selected.length < max) {
      onChange([...selected, genre]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => {
        const isSelected = selected.includes(genre);
        const isDisabled = !isSelected && selected.length >= max;
        
        return (
          <Button
            key={genre}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleGenre(genre)}
            disabled={isDisabled}
            className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            {genre}
          </Button>
        );
      })}
      {selected.length > 0 && (
        <p className="w-full text-xs text-muted-foreground mt-1">
          {selected.length}/{max} selected
        </p>
      )}
    </div>
  );
}
