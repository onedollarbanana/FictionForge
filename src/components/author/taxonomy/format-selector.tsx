'use client'

import { STORY_FORMATS, type StoryFormat } from '@/lib/constants'

interface FormatSelectorProps {
  value: string | null
  onChange: (format: string) => void
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {STORY_FORMATS.map((format: StoryFormat) => {
        const isSelected = value === format.value
        return (
          <button
            key={format.value}
            type="button"
            onClick={() => onChange(format.value)}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.005] ${
              isSelected
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-border bg-card hover:border-amber-500/40'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className={`font-semibold text-sm ${isSelected ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                  {format.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{format.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
