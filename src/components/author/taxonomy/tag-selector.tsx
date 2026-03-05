'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { TAG_GROUPS, TAG_CAP, tagCountsTowardCap, type TagGroup, type Tag } from '@/lib/constants'

interface TagSelectorProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'tone-mood': true,
    'romantic-relationship': true,
    'character-pov': false,
    'plot-structure': false,
    'world-setting': false,
    'power-progression': false,
    'tropes-story-patterns': false,
    'representation': false,
  })

  const cappedCount = value.filter(t => tagCountsTowardCap(t)).length
  const remainingCap = TAG_CAP - cappedCount

  const toggle = (tagSlug: string) => {
    if (value.includes(tagSlug)) {
      onChange(value.filter(t => t !== tagSlug))
    } else {
      const counts = tagCountsTowardCap(tagSlug)
      if (counts && cappedCount >= TAG_CAP) return // cap reached
      onChange([...value, tagSlug])
    }
  }

  const toggleGroup = (slug: string) => {
    setExpandedGroups(prev => ({ ...prev, [slug]: !prev[slug] }))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Discovery tags: <span className={cappedCount >= TAG_CAP ? 'text-amber-500 font-medium' : ''}>{cappedCount}/{TAG_CAP}</span>
        </span>
        <span className="text-xs text-muted-foreground">Tone & Mood and Representation are unlimited</span>
      </div>

      <div className="space-y-1">
        {TAG_GROUPS.map((group: TagGroup) => {
          const isExpanded = expandedGroups[group.slug] ?? false
          const groupSelectedCount = value.filter(t =>
            group.tags.some((tag: Tag) => tag.slug === t)
          ).length

          return (
            <div key={group.slug} className="border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group.slug)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{group.name}</span>
                  {!group.countsTowardCap && (
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      unlimited
                    </span>
                  )}
                  {groupSelectedCount > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      {groupSelectedCount} selected
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="p-3 flex flex-wrap gap-2">
                  {group.tags.map((tag: Tag) => {
                    const isSelected = value.includes(tag.slug)
                    const isDisabled = !isSelected && group.countsTowardCap && remainingCap <= 0
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() => toggle(tag.slug)}
                        disabled={isDisabled}
                        title={tag.description}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-white'
                            : isDisabled
                            ? 'bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
                            : 'bg-muted hover:bg-muted/70'
                        }`}
                      >
                        {tag.name}
                        <Info className="h-3 w-3 opacity-50" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {value.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Selected tags:</p>
          <div className="flex flex-wrap gap-1">
            {value.map(slug => {
              const tag = TAG_GROUPS.flatMap(g => g.tags).find((t: Tag) => t.slug === slug)
              if (!tag) return null
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggle(slug)}
                  className="px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded text-xs hover:bg-amber-500/25 transition-colors"
                >
                  {tag.name} ×
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
