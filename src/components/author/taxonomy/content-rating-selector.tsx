'use client'

import { CONTENT_RATINGS, type ContentRating } from '@/lib/constants'
import { Shield, ShieldAlert, ShieldX, ShieldCheck } from 'lucide-react'

interface ContentRatingSelectorProps {
  value: string | null
  onChange: (rating: ContentRating['value']) => void
  minimumRequired?: ContentRating['value'] | null
}

const ratingIcons = {
  everyone: ShieldCheck,
  teen: Shield,
  mature: ShieldAlert,
  adult_18: ShieldX,
}

const ratingColours = {
  everyone: 'border-green-500 bg-green-500/10',
  teen: 'border-blue-500 bg-blue-500/10',
  mature: 'border-amber-500 bg-amber-500/10',
  adult_18: 'border-red-500 bg-red-500/10',
}

const ratingSelectedText = {
  everyone: 'text-green-700 dark:text-green-300',
  teen: 'text-blue-700 dark:text-blue-300',
  mature: 'text-amber-700 dark:text-amber-300',
  adult_18: 'text-red-700 dark:text-red-300',
}

export function ContentRatingSelector({ value, onChange, minimumRequired }: ContentRatingSelectorProps) {
  const ratingOrder = ['everyone', 'teen', 'mature', 'adult_18']
  const minIndex = minimumRequired ? ratingOrder.indexOf(minimumRequired) : -1

  return (
    <div className="space-y-2">
      {minimumRequired && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
          Based on your content warnings, this story requires at minimum a <strong>{CONTENT_RATINGS.find(r => r.value === minimumRequired)?.label}</strong> rating.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CONTENT_RATINGS.map((rating: ContentRating) => {
          const isSelected = value === rating.value
          const isDisabled = minIndex > -1 && ratingOrder.indexOf(rating.value) < minIndex
          const Icon = ratingIcons[rating.value]

          return (
            <button
              key={rating.value}
              type="button"
              onClick={() => !isDisabled && onChange(rating.value)}
              disabled={isDisabled}
              className={`relative flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? ratingColours[rating.value]
                  : isDisabled
                  ? 'border-border bg-muted/30 opacity-40 cursor-not-allowed'
                  : 'border-border bg-card hover:border-muted-foreground/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-current flex items-center justify-center flex-shrink-0 opacity-70">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isSelected ? ratingSelectedText[rating.value] : 'text-muted-foreground'}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${isSelected ? ratingSelectedText[rating.value] : ''}`}>
                    {rating.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{rating.comparable}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rating.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{rating.examples}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
