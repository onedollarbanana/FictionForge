'use client'

import { PRIMARY_GENRES, type PrimaryGenre } from '@/lib/constants'

interface PrimaryGenreSelectorProps {
  value: string | null
  onChange: (slug: string) => void
}

export function PrimaryGenreSelector({ value, onChange }: PrimaryGenreSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRIMARY_GENRES.map((genre: PrimaryGenre) => {
          const isSelected = value === genre.slug
          return (
            <button
              key={genre.slug}
              type="button"
              onClick={() => onChange(genre.slug)}
              className={`relative flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.01] ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/20'
                  : 'border-border bg-card hover:border-amber-500/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-xl">{genre.emoji}</span>
              <span className="font-semibold text-sm">{genre.name}</span>
              <span className="text-xs text-muted-foreground leading-tight">{genre.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
