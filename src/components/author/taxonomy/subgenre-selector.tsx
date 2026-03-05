'use client'

import { getSubgenresForGenre, type Subgenre } from '@/lib/constants'

const MAX_SUBGENRES = 3

interface SubgenreSelectorProps {
  primaryGenreSlug: string | null
  value: string[]
  onChange: (subgenres: string[]) => void
}

export function SubgenreSelector({ primaryGenreSlug, value, onChange }: SubgenreSelectorProps) {
  const subgenres = primaryGenreSlug ? getSubgenresForGenre(primaryGenreSlug) : []

  if (!primaryGenreSlug || subgenres.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Select a primary genre first to see available subgenres.
      </p>
    )
  }

  const toggle = (slug: string) => {
    if (value.includes(slug)) {
      onChange(value.filter(s => s !== slug))
    } else if (value.length < MAX_SUBGENRES) {
      onChange([...value, slug])
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Select up to {MAX_SUBGENRES} — {value.length}/{MAX_SUBGENRES} chosen
      </p>
      <div className="flex flex-wrap gap-2">
        {subgenres.map((sub: Subgenre) => {
          const isSelected = value.includes(sub.slug)
          const isDisabled = !isSelected && value.length >= MAX_SUBGENRES
          return (
            <button
              key={sub.slug}
              type="button"
              onClick={() => toggle(sub.slug)}
              disabled={isDisabled}
              title={sub.authorGuidance}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-amber-500 text-white'
                  : isDisabled
                  ? 'bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {sub.name}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <div className="mt-2 space-y-1">
          {value.map(slug => {
            const sub = subgenres.find(s => s.slug === slug)
            if (!sub) return null
            return (
              <p key={slug} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{sub.name}:</span> {sub.authorGuidance}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}
